import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { leadFormSchema } from "@/lib/leads/schema";
import { normalizePhoneToE164, maskPhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";
import { getSmsProvider, renderConfirmationSms } from "@/lib/sms";
import { siteConfig } from "@/content/site.config";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`lead:${ip}`);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const website = String(form.get("website") ?? "");
  if (website) {
    return NextResponse.json({ ok: true, phoneMasked: "•••-•••-0000" });
  }

  let attribution: Record<string, string> = {};
  try {
    const raw = form.get("attribution");
    if (typeof raw === "string" && raw) attribution = JSON.parse(raw) as Record<string, string>;
  } catch {
    /* ignore */
  }

  const parsed = leadFormSchema.safeParse({
    firstName: form.get("firstName"),
    phone: form.get("phone"),
    email: form.get("email") ?? "",
    artistId: form.get("artistId") || undefined,
    idea: form.get("idea"),
    size: form.get("size"),
    placement: form.get("placement"),
    placementNotes: form.get("placementNotes") ?? "",
    timing: form.get("timing") ?? "",
    website: "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check your answers and try again." },
      { status: 400 },
    );
  }

  const phoneE164 = normalizePhoneToE164(parsed.data.phone);
  if (!phoneE164) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid mobile number." },
      { status: 400 },
    );
  }

  const files = form.getAll("references").filter((f): f is File => f instanceof File);

  if (!hasSupabaseAdmin()) {
    console.info("[dev] Lead captured without Supabase", {
      ...parsed.data,
      phoneE164,
      files: files.length,
      attribution,
    });
    return NextResponse.json({
      ok: true,
      phoneMasked: maskPhone(phoneE164),
      dev: true,
    });
  }

  const supabase = createAdminClient();
  const leadId = randomUUID();

  const { error: insertError } = await supabase.from("leads").insert({
    id: leadId,
    first_name: parsed.data.firstName,
    phone_e164: phoneE164,
    email: parsed.data.email || null,
    artist_id: parsed.data.artistId || null,
    idea: parsed.data.idea,
    size: parsed.data.size,
    placement: parsed.data.placement,
    placement_notes: parsed.data.placementNotes || null,
    timing: parsed.data.timing || null,
    status: "new",
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_content: attribution.utm_content ?? null,
    utm_term: attribution.utm_term ?? null,
    gclid: attribution.gclid ?? null,
    landing_page: attribution.landing_page ?? null,
    referrer: attribution.referrer ?? null,
    sms_sync_status: "pending",
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      { ok: false, error: "Could not save your request. Please try again." },
      { status: 500 },
    );
  }

  for (let i = 0; i < Math.min(files.length, MAX_FILES); i++) {
    const file = files[i];
    if (file.size > MAX_FILE_BYTES) continue;

    let buffer = Buffer.from(await file.arrayBuffer());
    let mime = file.type || "application/octet-stream";
    if (!ALLOWED_MIME.has(mime) && mime !== "application/octet-stream") continue;

    if (mime === "image/heic" || mime === "image/heif") {
      try {
        buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
        mime = "image/jpeg";
      } catch {
        continue;
      }
    }

    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${leadId}/${i}-${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("lead-references")
      .upload(path, buffer, { contentType: mime, upsert: false });

    if (!uploadError) {
      await supabase.from("lead_images").insert({
        lead_id: leadId,
        storage_path: path,
        mime,
        size_bytes: buffer.length,
        sort_order: i,
      });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const adminLeadUrl = `${siteUrl}/admin/leads/${leadId}`;

  const leadRecord = {
    id: leadId,
    first_name: parsed.data.firstName,
    phone_e164: phoneE164,
    email: parsed.data.email || null,
    artist_id: parsed.data.artistId || null,
    idea: parsed.data.idea,
    size: parsed.data.size,
    placement: parsed.data.placement,
    placement_notes: parsed.data.placementNotes || null,
    timing: parsed.data.timing || null,
  };

  const smsBody = renderConfirmationSms(siteConfig.copy.confirmationSmsTemplate, {
    firstName: parsed.data.firstName,
    studioName: siteConfig.studio.name,
  });

  try {
    const sms = getSmsProvider();
    const { contactId } = await sms.upsertContact(leadRecord, adminLeadUrl);
    await sms.sendConfirmation(leadRecord, smsBody);

    await supabase
      .from("leads")
      .update({
        quo_contact_id: contactId ?? null,
        sms_sync_status: "sent",
        sms_error: null,
      })
      .eq("id", leadId);

    await supabase.from("communication_logs").insert({
      lead_id: leadId,
      channel: "sms",
      provider: process.env.SMS_PROVIDER ?? "mock",
      summary: "Confirmation SMS sent",
      success: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS sync failed";
    await supabase
      .from("leads")
      .update({ sms_sync_status: "failed", sms_error: message })
      .eq("id", leadId);
    await supabase.from("communication_logs").insert({
      lead_id: leadId,
      channel: "sms",
      provider: process.env.SMS_PROVIDER ?? "mock",
      summary: message,
      success: false,
    });
  }

  return NextResponse.json({ ok: true, phoneMasked: maskPhone(phoneE164) });
}
