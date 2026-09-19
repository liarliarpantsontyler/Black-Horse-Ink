import { MockSmsProvider } from "./mock";
import { QuoSmsProvider } from "./quo";
import type { SmsProvider } from "./types";

export function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? "mock";
  if (provider === "quo") {
    const apiKey = process.env.QUO_API_KEY;
    const phoneId = process.env.QUO_PHONE_NUMBER_ID;
    if (!apiKey || !phoneId) {
      throw new Error("SMS_PROVIDER=quo requires QUO_API_KEY and QUO_PHONE_NUMBER_ID");
    }
    return new QuoSmsProvider(apiKey, phoneId);
  }
  return new MockSmsProvider();
}

export function renderConfirmationSms(
  template: string,
  vars: { firstName: string; studioName: string },
) {
  return template
    .replace(/\{\{firstName\}\}/g, vars.firstName)
    .replace(/\{\{studioName\}\}/g, vars.studioName);
}

export type { LeadRecord, SmsProvider } from "./types";
