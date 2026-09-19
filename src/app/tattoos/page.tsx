import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LocationBlock } from "@/components/home/LocationBlock";
import { siteConfig } from "@/content/site.config";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Small & medium custom tattoos",
  description:
    "Small and medium custom tattoos with Lucia and Juan. Get a quote by text — no phone call needed.",
  path: "/tattoos",
});

export default function TattoosLandingPage() {
  const primary = siteConfig.artists.filter((a) => a.inquiryType === "primary");

  return (
    <SiteShell>
      <Hero
        title="Small & medium tattoos, done right."
        subtitle="Custom work with Lucia and Juan. Tell us your idea — we'll text you back."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {primary.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>
      <PortfolioGrid />
      <HowItWorks />
      <LocationBlock />
    </SiteShell>
  );
}
