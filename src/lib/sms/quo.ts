import type { LeadRecord, SmsProvider } from "./types";

const API_BASE = "https://api.quo.com/v1";

export class QuoSmsProvider implements SmsProvider {
  constructor(
    private apiKey: string,
    private phoneNumberId: string,
  ) {}

  private headers() {
    return {
      Authorization: this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async upsertContact(lead: LeadRecord, adminLeadUrl: string) {
    const payload = {
      defaultFields: {
        firstName: lead.first_name,
        phoneNumbers: [{ name: "mobile", value: lead.phone_e164 }],
        ...(lead.email ? { emails: [{ name: "email", value: lead.email }] } : {}),
      },
      externalId: lead.id,
      source: "black-horse-ink-web",
      sourceUrl: adminLeadUrl,
    };

    const res = await fetch(`${API_BASE}/contacts`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Quo contact create failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { data?: { id?: string } };
    return { contactId: json.data?.id };
  }

  async sendConfirmation(lead: LeadRecord, messageBody: string) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        content: messageBody,
        from: this.phoneNumberId,
        to: [lead.phone_e164],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Quo SMS failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { data?: { id?: string } };
    return { messageId: json.data?.id };
  }
}
