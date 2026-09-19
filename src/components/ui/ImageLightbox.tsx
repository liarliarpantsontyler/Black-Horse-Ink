"use client";

import Image from "next/image";
import { useEffect } from "react";
import { siteConfig } from "@/content/site.config";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
  /** Shows hint + primary CTA pill (portfolio / work context) */
  onQuote?: () => void;
  quoteHint?: string;
};

export function ImageLightbox({
  src,
  alt,
  onClose,
  onQuote,
  quoteHint = siteConfig.copy.quoteLikeThisHint,
}: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-surface shadow-2xl md:max-h-[85vh] md:rounded-3xl">
        <div className="flex items-center justify-end border-b border-border/40 px-4 py-2">
          <button
            type="button"
            className="min-h-10 px-3 text-sm text-muted hover:text-foreground"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <div className="relative w-full overflow-hidden rounded-xl bg-background/40">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={1500}
              className="h-auto max-h-[min(52dvh,520px)] w-full object-contain"
              sizes="(max-width:768px) 100vw, 512px"
              priority
            />
          </div>

          {onQuote ? (
            <div className="mt-5 text-center">
              <p className="text-sm text-muted">{quoteHint}</p>
              <button
                type="button"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent-strong px-8 text-sm font-semibold tracking-wide text-background transition-colors hover:bg-accent-strong/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                onClick={onQuote}
              >
                {siteConfig.copy.primaryCta}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
