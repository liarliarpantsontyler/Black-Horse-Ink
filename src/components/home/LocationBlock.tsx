"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

export function LocationBlock() {
  const { openQuote } = useQuote();
  const { studio } = siteConfig;

  return (
    <section id="location" className="scroll-mt-20 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl">Visit the studio</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-sm leading-relaxed text-muted">
            <p className="text-lg font-medium text-foreground">{studio.name}</p>
            <p>{studio.address}</p>
            <p>{studio.cityState}</p>
            <ul>
              {studio.hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {studio.parkingNote && !studio.parkingNote.startsWith("[") && (
              <p>{studio.parkingNote}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Button type="button" fullWidth onClick={() => openQuote()}>
              {siteConfig.copy.primaryCta}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              type="button"
              onClick={() => {
                trackEvent("directions_click");
                window.open(studio.mapsUrl, "_blank", "noopener,noreferrer");
              }}
            >
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
