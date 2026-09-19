import type { LeadRecord, SmsProvider } from "./types";

export class MockSmsProvider implements SmsProvider {
  async upsertContact(lead: LeadRecord, adminLeadUrl: string) {
    console.info("[MockSms] upsertContact", {
      leadId: lead.id,
      phone: lead.phone_e164,
      adminLeadUrl,
    });
    return { contactId: `mock-${lead.id}` };
  }

  async sendConfirmation(lead: LeadRecord, messageBody: string) {
    console.info("[MockSms] sendConfirmation", {
      to: lead.phone_e164,
      body: messageBody,
    });
    return { messageId: `mock-msg-${lead.id}` };
  }
}
