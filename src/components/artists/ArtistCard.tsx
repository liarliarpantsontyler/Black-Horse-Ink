"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { LetterFadeDisplay } from "@/components/ui/LetterFadeDisplay";
import { useFadeInView } from "@/components/ui/useFadeInView";
import type { Artist, PortfolioItem } from "@/content/schemas";
import { getPortfolioByArtist } from "@/content/portfolio";
import { getQuoteWithArtist, siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, InstagramIcon } from "@/components/ui/icons";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { trackEvent } from "@/lib/analytics";

type Props = {
  artist: Artist;
};

type LightboxState = { item: PortfolioItem };

export function ArtistCard({ artist }: Props) {
  const { openQuote } = useQuote();
  const thumbs = getPortfolioByArtist(artist.id, 4);
  const deemph = artist.visualWeight === "de-emphasized";
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const headline =
    artist.id === "lucia"
      ? "Fine-line · Small to Medium Tattoos"
      : artist.id === "juan"
        ? "Small to Medium Custom Tattoos"
        : "Realism + Traditional + Large Custom Projects";

  const ctaLabel =
    artist.inquiryType === "large_projects"
      ? siteConfig.copy.largeProjectCta
      : getQuoteWithArtist(artist.name);

  function closeLightbox() {
    setLightbox(null);
  }

  const workPossessive =
    artist.pronouns?.startsWith("she") === true
      ? "her"
      : artist.pronouns?.startsWith("he") === true
        ? "his"
        : "their";

  return (
    <>
      <article
        className={[
          "flex flex-col overflow-hidden rounded-2xl border bg-surface",
          deemph ? "border-border/40 opacity-95" : "border-border/70",
        ].join(" ")}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={artist.portrait}
            alt={`Portrait of ${artist.name}`}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          <div>
            <h3 className="font-display text-2xl">{artist.name}</h3>
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
                onClick={() => setLightbox({ item: t })}
              >
                <Image src={t.image} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-1">
            <Button type="button" fullWidth onClick={() => openQuote(artist.id)}>
              {ctaLabel}
            </Button>
            <a
              href={artist.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-wrap items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
              onClick={() =>
                trackEvent("instagram_click", { artist_id: artist.id })
              }
            >
              View {workPossessive} work on Instagram
              <InstagramIcon size={16} className="shrink-0" />
              <ArrowRightIcon size={16} className="shrink-0" />
            </a>
          </div>
        </div>
      </article>

      {lightbox && (
        <ImageLightbox
          src={lightbox.item.image}
          alt={lightbox.item.alt}
          onClose={closeLightbox}
          artistName={artist.name}
          onQuote={() => {
            closeLightbox();
            openQuote(artist.id);
          }}
        />
      )}
    </>
  );
}

export function ArtistSelectorSection() {
  const fadeIntro = useFadeInView(0.08);

  return (
    <section id="artists" className="scroll-mt-20 pb-16 pt-0 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <LetterFadeDisplay
          as="h2"
          when="inView"
          text="Who do you want to work with?"
          className="font-display text-3xl md:text-4xl"
        />
        <motion.p {...fadeIntro} className="mt-2 max-w-lg text-muted">
          <span className="font-medium text-response-highlight">
            {siteConfig.copy.responseTimeCopy}
          </span>
          .
          <br />
          {siteConfig.copy.primaryCta} by text — no phone call needed.
        </motion.p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {siteConfig.artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </div>
    </section>
  );
}
