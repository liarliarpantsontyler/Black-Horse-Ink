import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { LocationBlock } from "@/components/home/LocationBlock";
import { getArtistById } from "@/content/site.config";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Large custom tattoo projects",
  description:
    "Multi-session and large-scale custom tattoos with Marcos at Black Horse Ink.",
  path: "/large-tattoos",
});

export default function LargeTattoosPage() {
  const marcos = getArtistById("marcos");
  if (!marcos) return null;

  return (
    <SiteShell>
      <Hero
        title="Ready for something bigger?"
        subtitle="Large custom projects and multi-session work with Marcos."
        presetArtistId="marcos"
      />
      <section className="mx-auto max-w-lg px-4 pb-8 md:px-6">
        <ArtistCard artist={marcos} />
      </section>
      <PortfolioGrid artistId="marcos" />
      <LocationBlock />
    </SiteShell>
  );
}
