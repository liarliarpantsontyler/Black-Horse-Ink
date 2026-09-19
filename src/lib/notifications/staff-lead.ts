import { siteConfig } from "@/content/site.config";
import { getSmsProvider } from "@/lib/sms";
import type { LeadRecord } from "@/lib/sms/types";
import { sendStaffEmail } from "@/lib/email";

export const STAFF_NOTIFY_PHONE_E164 =
  process.env.LEAD_NOTIFY_PHONE ?? "+19402524142";
export const STAFF_NOTIFY_EMAIL =
  process.env.LEAD_NOTIFY_EMAIL ?? "tylerjameshunter@gmail.com";

function artistLabel(artistId?: string | null) {
  if (!artistId) return "No preference";
  const artist = siteConfig.artists.find((a) => a.id === artistId);
  return artist?.name ?? artistId;
}

function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

export function buildStaffLeadSms(lead: LeadRecord, adminLeadUrl: string) {
  const lines = [
    `New ${siteConfig.studio.name} quote`,
    `${lead.first_name} | ${lead.phone_e164}`,
    truncate(lead.idea, 120),
    `Size: ${lead.size} | ${lead.placement}`,
    artistLabel(lead.artist_id),
    adminLeadUrl,
  ];
  return lines.filter(Boolean).join("\n");
}

export function buildStaffLeadEmail(lead: LeadRecord, adminLeadUrl: string) {
  const subject = `New tattoo quote - ${lead.first_name}`;
  const text = [
    `New quote request for ${siteConfig.studio.name}`,
    "",
    `Name: ${lead.first_name}`,
    `Phone: ${lead.phone_e164}`,
    lead.email ? `Email: ${lead.email}` : null,
    `Artist: ${artistLabel(lead.artist_id)}`,
    `Size: ${lead.size}`,
    `Placement: ${lead.placement}`,
    lead.placement_notes ? `Placement notes: ${lead.placement_notes}` : null,
    lead.timing ? `Timing: ${lead.timing}` : null,
    "",
    "Idea:",
    lead.idea,
    "",
    `Admin: ${adminLeadUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text };
}

export async function notifyStaffOfNewLead(
  lead: LeadRecord,
  adminLeadUrl: string,
): Promise<{ smsOk: boolean; emailOk: boolean; errors: string[] }> {
  const errors: string[] = [];
  let smsOk = false;
  let emailOk = false;

  const smsBody = buildStaffLeadSms(lead, adminLeadUrl);
  try {
    const sms = getSmsProvider();
    await sms.sendMessage([STAFF_NOTIFY_PHONE_E164], smsBody);
    smsOk = true;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Staff SMS failed");
  }

  const { subject, text } = buildStaffLeadEmail(lead, adminLeadUrl);
  try {
    await sendStaffEmail({
      to: STAFF_NOTIFY_EMAIL,
      subject,
      text,
    });
    emailOk = true;
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Staff email failed");
  }

  return { smsOk, emailOk, errors };
}
