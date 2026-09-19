export type LeadRecord = {
  id: string;
  first_name: string;
  phone_e164: string;
  email?: string | null;
  artist_id?: string | null;
  idea: string;
  size: string;
  placement: string;
  placement_notes?: string | null;
  timing?: string | null;
};

export interface SmsProvider {
  upsertContact(lead: LeadRecord, adminLeadUrl: string): Promise<{ contactId?: string }>;
  sendConfirmation(
    lead: LeadRecord,
    messageBody: string,
  ): Promise<{ messageId?: string }>;
  sendMessage(
    to: string[],
    messageBody: string,
  ): Promise<{ messageId?: string }>;
}
