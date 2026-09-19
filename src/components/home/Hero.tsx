"use client";

import Image from "next/image";
import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

type HeroProps = {
  title?: string;
  subtitle?: string;
  presetArtistId?: string;
};

export function Hero({
  title = "Your next tattoo starts here.",
  subtitle,
  presetArtistId,
}: HeroProps) {
  const { openQuote } = useQuote();
  const sub =
    subtitle ??
    siteConfig.studio.tagline.replace("[CITY, STATE]", siteConfig.studio.cityState);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
        <h1 className="font-display max-w-xl text-4xl leading-tight tracking-tight md:text-6xl">
          {title}
        </h1>
        <p className="max-w-md text-lg text-muted">{sub}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={() => openQuote(presetArtistId)}
            className="min-h-14 px-8 text-base"
          >
            {siteConfig.copy.primaryCta}
          </Button>
          <a
            href="#work"
            className="text-center text-sm text-muted underline-offset-4 hover:text-foreground hover:underline sm:text-left"
          >
            See our work ↓
          </a>
        </div>
        <p className="text-sm text-muted">{siteConfig.copy.ctaSubtext}</p>
        <p className="text-xs text-muted/80">{siteConfig.copy.responseTimeCopy}</p>
      </div>
    </section>
  );
}
