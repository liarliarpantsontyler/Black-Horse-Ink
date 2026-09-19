type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  window.gtag?.("event", name, params);

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (name === "quote_completed" && adsId) {
    window.gtag?.("event", "conversion", {
      send_to: adsId,
    });
  }
}
