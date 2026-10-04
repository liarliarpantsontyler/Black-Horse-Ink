import { siteConfig, getArtistById } from "@/content/site.config";
import type { QuoteDraft } from "@/context/QuoteContext";
import { SIZE_OPTIONS, TIMING_OPTIONS } from "@/components/quote/types";

export const SHOP_PHONE_E164 = "+19409101094";

export function buildQuoteText(draft: QuoteDraft, referencesUrl?: string) {
  const size = SIZE_OPTIONS.find((option) => option.id === draft.size);
  const timing = TIMING_OPTIONS.find((option) => option.id === draft.timing);
  return [
    `Hi ${siteConfig.studio.name}! I'm ${draft.firstName?.trim()}. I'd like a tattoo quote.`,
    `Artist: ${getArtistById(draft.artistId ?? "")?.name ?? "No preference"}`,
    `Idea: ${draft.idea?.trim()}`,
    `Size: ${size ? `${size.label} (${size.hint})` : "Not sure"}`,
    `Placement: ${draft.placement || "Not sure"}`,
    draft.placementNotes?.trim() ? `Placement notes: ${draft.placementNotes.trim()}` : null,
    timing ? `Timing: ${timing.label}` : null,
    draft.phone?.trim() ? `Contact: ${draft.phone.trim()}` : null,
    draft.email?.trim() ? `Email: ${draft.email.trim()}` : null,
    referencesUrl ? `Reference photos: ${referencesUrl}` : null,
  ].filter(Boolean).join("\n");
}

export function shopSmsHref(message: string, userAgent: string) {
  // Apple handlers use &body; other handlers use the standard query separator.
  // Always offer copy/paste because some handlers ignore the body.
  const separator = /iPhone|iPad|iPod|Macintosh/i.test(userAgent) ? "&" : "?";
  return `sms:${SHOP_PHONE_E164}${separator}body=${encodeURIComponent(message)}`;
}
