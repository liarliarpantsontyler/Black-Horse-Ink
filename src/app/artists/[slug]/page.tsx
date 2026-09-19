import { notFound } from "next/navigation";
import Image from "next/image";
import { SiteShell } from "@/components/layout/SiteShell";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { LocationBlock } from "@/components/home/LocationBlock";
import { ArtistQuoteCTA } from "@/components/artists/ArtistQuoteCTA";
import { getArtistBySlug, siteConfig } from "@/content/site.config";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return siteConfig.artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) return {};
  return buildMetadata({
    title: `${artist.name} — tattoo artist`,
    description: `${artist.bio} Get a quote by text at ${siteConfig.studio.name}.`,
    path: `/artists/${slug}`,
  });
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) notFound();

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={artist.portrait}
              alt={`Portrait of ${artist.name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h1 className="font-display text-4xl md:text-5xl">{artist.name}</h1>
            <p className="mt-2 text-accent">{artist.specialties.join(" · ")}</p>
            <p className="mt-6 leading-relaxed text-muted">{artist.bio}</p>
            <ArtistQuoteCTA artistId={artist.id} instagram={artist.instagram} />
          </div>
        </div>
      </section>
      <PortfolioGrid artistId={artist.id} />
      <LocationBlock />
    </SiteShell>
  );
}
