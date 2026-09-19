"use client";

import { siteConfig } from "@/content/site.config";
import { HeroWorkGallery } from "@/components/home/HeroWorkGallery";
import { LetterFadeDisplay } from "@/components/ui/LetterFadeDisplay";
import { useFadeInView } from "@/components/ui/useFadeInView";
import { motion } from "framer-motion";

type HeroProps = {
  title?: string;
  subtitle?: string;
  presetArtistId?: string;
};

export function Hero({
  title = "Your next tattoo starts here.",
  subtitle,
}: HeroProps) {
  const fadeTagline = useFadeInView(0.12);
  const sub =
    subtitle ??
    siteConfig.studio.tagline.replace("[CITY, STATE]", siteConfig.studio.cityState);

  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-0 pt-8 md:gap-6 md:px-6 md:pt-16">
        <div className="flex max-w-xl flex-col gap-1.5">
          <LetterFadeDisplay
            as="h1"
            text={title}
            className="font-display text-4xl leading-[1.1] tracking-tight md:text-6xl"
          />
          <motion.p
            {...fadeTagline}
            className="max-w-md text-base leading-snug text-muted md:text-lg"
          >
            {sub}
          </motion.p>
        </div>
        <HeroWorkGallery />
      </div>
    </section>
  );
}
