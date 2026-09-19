"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Artist, PortfolioItem } from "@/content/schemas";
import { getPortfolioByArtist } from "@/content/portfolio";
import { getQuoteWithArtist, siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { trackEvent } from "@/lib/analytics";

type Props = {
  artist: Artist;
};

type LightboxState =
  | { type: "portrait"; src: string; alt: string }
  | { type: "work"; item: PortfolioItem };

export function ArtistCard({ artist }: Props) {
  const { openQuote } = useQuote();
  const thumbs = getPortfolioByArtist(artist.id, 4);
  const deemph = artist.visualWeight === "de-emphasized";
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const headline =
    artist.id === "lucia"
      ? "Fine-line + small tattoos"
      : artist.id === "juan"
        ? "Small + medium custom tattoos"
        : "Large custom projects";

  const ctaLabel =
    artist.inquiryType === "large_projects"
      ? siteConfig.copy.largeProjectCta
      : getQuoteWithArtist(artist.name);

  function closeLightbox() {
    setLightbox(null);
  }

  return (
    <>
      <article
        className={[
          "flex flex-col overflow-hidden rounded-2xl border bg-surface",
          deemph ? "border-border/40 opacity-95" : "border-border/70",
        ].join(" ")}
      >
        <button
          type="button"
          className="relative aspect-square w-full cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`View photo of ${artist.name}`}
          onClick={() =>
            setLightbox({
              type: "portrait",
              src: artist.portrait,
              alt: `Portrait of ${artist.name}`,
            })
          }
        >
          <Image
            src={artist.portrait}
            alt=""
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </button>
        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          <div>
            <h3 className="font-display text-xl md:text-2xl">{artist.name}</h3>
            <p className="mt-0.5 text-sm text-accent">{headline}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
              {artist.bio}
            </p>
            {artist.id === "marcos" && (
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                Looking for something bigger? {artist.name} focuses on larger custom
                pieces and multi-session work.
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {thumbs.map((t) => (
              <button
                key={t.id}
                type="button"
                className="relative aspect-square cursor-zoom-in overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`View tattoo: ${t.alt}`}
                onClick={() => setLightbox({ type: "work", item: t })}
              >
                <Image src={t.image} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-1">
            <Button type="button" fullWidth onClick={() => openQuote(artist.id)}>
              {ctaLabel}
            </Button>
            <div className="flex items-center justify-between gap-2 text-sm">
              <Link
                href={`/artists/${artist.slug}`}
                className="text-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                View {artist.id === "lucia" ? "her" : "his"} work
              </Link>
              <a
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground"
                onClick={() =>
                  trackEvent("instagram_click", { artist_id: artist.id })
                }
              >
                IG
              </a>
            </div>
          </div>
        </div>
      </article>

      {lightbox && (
        <ImageLightbox
          src={lightbox.type === "portrait" ? lightbox.src : lightbox.item.image}
          alt={lightbox.type === "portrait" ? lightbox.alt : lightbox.item.alt}
          onClose={closeLightbox}
          onQuote={
            lightbox.type === "work"
              ? () => {
                  closeLightbox();
                  openQuote(artist.id);
                }
              : undefined
          }
        />
      )}
    </>
  );
}

export function ArtistSelectorSection() {
  return (
    <section id="artists" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl md:text-4xl">Who do you want to work with?</h2>
        <p className="mt-2 max-w-lg text-muted">
          <span className="font-medium text-response-highlight">
            {siteConfig.copy.responseTimeCopy}
          </span>
          . {siteConfig.copy.primaryCta} by text — no phone call needed.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {siteConfig.artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </div>
    </section>
  );
}
