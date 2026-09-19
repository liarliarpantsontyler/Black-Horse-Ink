import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhoneToE164(raw: string, defaultCountry: "US" = "US") {
  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  if (!parsed?.isValid()) return null;
  return parsed.format("E.164");
}

export function maskPhone(e164: string) {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 4) return "•••-•••-••••";
  const last4 = digits.slice(-4);
  return `•••-•••-${last4}`;
}
