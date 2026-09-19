import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { LocationBlock } from "@/components/home/LocationBlock";
import { getArtistById } from "@/content/site.config";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Fine-line tattoos",
  description:
    "Fine-line, minimalist, and small tattoos with Lucia at Black Horse Ink. Get a quote by text.",
  path: "/fine-line-tattoos",
});

export default function FineLinePage() {
  const lucia = getArtistById("lucia");
  if (!lucia) return null;

  return (
    <SiteShell>
      <Hero
        title="Fine-line & minimalist tattoos."
        subtitle={`Delicate, precise work with ${lucia.name} in [CITY, STATE].`}
        presetArtistId="lucia"
      />
      <section className="mx-auto max-w-lg px-4 pb-8 md:px-6">
        <ArtistCard artist={lucia} />
      </section>
      <PortfolioGrid artistId="lucia" />
      <ReviewsSection />
      <FAQAccordion />
      <LocationBlock />
    </SiteShell>
  );
}
