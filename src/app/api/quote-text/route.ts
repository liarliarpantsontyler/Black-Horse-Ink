import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { leadFormSchema } from "@/lib/leads/schema";
import { normalizePhoneToE164 } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`quote-text:${ip}`).ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  const form = await request.formData();
  const parsed = leadFormSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success || !normalizePhoneToE164(parsed.data.phone)) {
    return NextResponse.json({ error: "Please check your answers and mobile number." }, { status: 400 });
  }
  const files = form.getAll("references").filter((value): value is File => value instanceof File);
  if (files.length > 5 || files.some((file) => file.size > 5 * 1024 * 1024)) {
    return NextResponse.json({ error: "Choose up to five photos, each under 5 MB." }, { status: 400 });
  }
  // Text-only quotes can work without storage; never pretend photos were saved.
  if (!hasSupabaseAdmin()) {
    return files.length
      ? NextResponse.json({ error: "Photo storage is not available yet. Try again later, or remove the photos and attach them in Messages." }, { status: 503 })
      : NextResponse.json({ ok: true });
  }
  const prepared: Buffer[] = [];
  try {
    for (const file of files) {
      // Decode and re-encode rather than trusting the browser's MIME type.
      prepared.push(await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
        .rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 }).toBuffer());
    }
  } catch {
    return NextResponse.json({ error: "One of your photos could not be read. Try a JPG or PNG instead." }, { status: 400 });
  }
  const db = createAdminClient();
  const id = randomUUID();
  const token = randomUUID();
  const paths: string[] = [];
  try {
    const data = parsed.data;
    const { error } = await db.from("leads").insert({
      id, lead_detail_token: token, first_name: data.firstName,
      phone_e164: normalizePhoneToE164(data.phone), email: data.email || null,
      artist_id: data.artistId || null, idea: data.idea, size: data.size,
      placement: data.placement, placement_notes: data.placementNotes || null,
      timing: data.timing || null, sms_sync_status: "skipped",
    });
    if (error) throw error;
    for (const [index, buffer] of prepared.entries()) {
      const path = `${id}/${index}-${randomUUID()}.jpg`;
      const { error: uploadError } = await db.storage.from("lead-references")
        .upload(path, buffer, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      paths.push(path);
      const { error: imageError } = await db.from("lead_images").insert({
        lead_id: id, storage_path: path, mime: "image/jpeg", size_bytes: buffer.length, sort_order: index,
      });
      if (imageError) throw imageError;
    }
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    return NextResponse.json({ ok: true, referencesUrl: files.length ? new URL(`/references/${token}`, origin).href : undefined });
  } catch {
    if (paths.length) await db.storage.from("lead-references").remove(paths);
    await db.from("leads").delete().eq("id", id);
    return NextResponse.json({ error: "Could not save your photos and details. Please try again." }, { status: 500 });
  }
}
