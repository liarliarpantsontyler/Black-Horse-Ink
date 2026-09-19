const STORAGE_KEY = "bhi_attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  landing_page?: string;
  referrer?: string;
};

export function captureAttributionFromUrl(search: string, pathname: string) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  const existing = getAttribution();
  const next: Attribution = { ...existing };

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const;
  for (const key of utmKeys) {
    const v = params.get(key);
    if (v) next[key] = v;
  }
  const gclid = params.get("gclid");
  if (gclid) next.gclid = gclid;
  if (!next.landing_page) next.landing_page = pathname;
  if (!next.referrer && document.referrer) next.referrer = document.referrer;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
