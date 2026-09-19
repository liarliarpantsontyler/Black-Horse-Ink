import { siteConfig } from "@/content/site.config";

export function tattooParlorJsonLd() {
  const { studio } = siteConfig;
  const hasRealAddress = !studio.address.startsWith("[");
  if (!hasRealAddress) return null;

  return {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: studio.name,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: studio.address,
      addressLocality: studio.cityState,
    },
    sameAs: [studio.instagram],
  };
}
