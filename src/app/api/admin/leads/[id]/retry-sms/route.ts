import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSmsProvider, renderConfirmationSms } from "@/lib/sms";
import { siteConfig } from "@/content/site.config";

type Props = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params;
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { data: adminRow } = await auth
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const adminLeadUrl = `${siteUrl}/admin/leads/${id}`;
  const leadRecord = {
    id: lead.id,
    first_name: lead.first_name,
    phone_e164: lead.phone_e164,
    email: lead.email,
    artist_id: lead.artist_id,
    idea: lead.idea,
    size: lead.size,
    placement: lead.placement,
    placement_notes: lead.placement_notes,
    timing: lead.timing,
  };

  const smsBody = renderConfirmationSms(siteConfig.copy.confirmationSmsTemplate, {
    firstName: lead.first_name,
    studioName: siteConfig.studio.name,
  });

  try {
    const sms = getSmsProvider();
    const { contactId } = await sms.upsertContact(leadRecord, adminLeadUrl);
    await sms.sendConfirmation(leadRecord, smsBody);
    await supabase
      .from("leads")
      .update({
        quo_contact_id: contactId ?? lead.quo_contact_id,
        sms_sync_status: "sent",
        sms_error: null,
      })
      .eq("id", id);
    await supabase.from("communication_logs").insert({
      lead_id: id,
      channel: "sms",
      provider: process.env.SMS_PROVIDER ?? "mock",
      summary: "Retry: confirmation SMS sent",
      success: true,
    });
    return NextResponse.json({ ok: true, status: "sent" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS sync failed";
    await supabase
      .from("leads")
      .update({ sms_sync_status: "failed", sms_error: message })
      .eq("id", id);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
