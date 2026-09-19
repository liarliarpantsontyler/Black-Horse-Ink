"use client";

import Image from "next/image";
import { siteConfig } from "@/content/site.config";
import { HeroWorkGallery } from "@/components/home/HeroWorkGallery";

type HeroProps = {
  title?: string;
  subtitle?: string;
  presetArtistId?: string;
};

export function Hero({
  title = "Your next tattoo starts here.",
  subtitle,
}: HeroProps) {
  const sub =
    subtitle ??
    siteConfig.studio.tagline.replace("[CITY, STATE]", siteConfig.studio.cityState);

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-12 pt-12 md:gap-5 md:px-6 md:pb-24 md:pt-20">
        <h1 className="font-display max-w-xl text-4xl leading-tight tracking-tight md:text-6xl">
          {title}
        </h1>
        <p className="max-w-md text-base text-muted md:text-lg">{sub}</p>
        <p className="text-sm leading-snug text-muted">{siteConfig.copy.ctaSubtext}</p>
        <p className="text-sm font-medium text-response-highlight">
          {siteConfig.copy.responseTimeCopy}
        </p>
        <HeroWorkGallery />
      </div>
    </section>
  );
}
