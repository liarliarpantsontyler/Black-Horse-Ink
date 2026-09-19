"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { portfolioItems } from "@/content/portfolio";
import type { PortfolioItem } from "@/content/schemas";
import { getArtistById, siteConfig } from "@/content/site.config";
import type { portfolioFilterSchema } from "@/content/schemas";
import { z } from "zod";
import { useQuote } from "@/context/QuoteContext";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

type Filter = z.infer<typeof portfolioFilterSchema>;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fine-line", label: "Fine Line" },
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

type Props = {
  artistId?: string;
  limit?: number;
};

export function PortfolioGrid({ artistId, limit }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const { openQuote } = useQuote();

  const items = useMemo(() => {
    let list = artistId
      ? portfolioItems.filter((p) => p.artistId === artistId)
      : portfolioItems;
    if (filter !== "all") {
      list = list.filter((p) => p.tags.includes(filter));
    }
    if (limit) list = list.slice(0, limit);
    return list;
  }, [artistId, filter, limit]);

  return (
    <section id="work" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl md:text-4xl">Recent work</h2>
        {!artistId && (
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={[
                  "min-h-11 rounded-full px-4 text-sm transition-colors",
                  filter === f.id
                    ? "bg-accent text-background"
                    : "border border-border text-muted hover:text-foreground",
                ].join(" ")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-8 columns-2 gap-3 md:columns-3 md:gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:mb-4"
              onClick={() => setActive(item)}
            >
              <Image
                src={item.image}
                alt={item.alt}
                width={900}
                height={1200}
                className="h-auto w-full object-cover"
                sizes="(max-width:768px) 50vw, 33vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {active && (
        <ImageLightbox
          src={active.image}
          alt={active.alt}
          onClose={() => setActive(null)}
          quoteHint={`Tattoo by ${getArtistById(active.artistId)?.name ?? "Artist"}. ${siteConfig.copy.quoteLikeThisHint}`}
          onQuote={() => {
            setActive(null);
            openQuote(active.artistId);
          }}
        />
      )}
    </section>
  );
}
