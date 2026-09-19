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
  /** Shown in header bar, e.g. "Lucia" → "Tattoo by Lucia" */
  artistName?: string;
};

export function ImageLightbox({
  src,
  alt,
  onClose,
  onQuote,
  quoteHint = siteConfig.copy.quoteLikeThisHint,
  artistName,
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
      <div className="relative flex max-h-[min(88dvh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white text-black shadow-2xl max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-0.5rem)] md:max-h-[85vh] md:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-2">
          {artistName ? (
            <p className="flex min-w-0 items-baseline gap-1 truncate">
              <span className="text-[18px] font-medium leading-snug text-accent-strong">
                Tattoo by:
              </span>
              <span className="font-display truncate text-2xl text-black">
                {artistName}
              </span>
            </p>
          ) : (
            <span className="min-h-10" aria-hidden />
          )}
          <button
            type="button"
            className="min-h-10 shrink-0 px-3 text-[18px] text-black/70 hover:text-black"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative w-full overflow-hidden bg-neutral-100">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={1500}
              className="block h-auto w-full max-w-none"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        {onQuote ? (
          <div className="shrink-0 border-t border-black/10 bg-white px-4 pt-3 text-center pb-[max(1rem,env(safe-area-inset-bottom))] max-md:pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
            <p className="text-base leading-snug text-black/75">{quoteHint}</p>
            <button
              type="button"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent-strong px-8 text-[18px] font-semibold tracking-wide text-black transition-colors hover:bg-accent-strong/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={onQuote}
            >
              {siteConfig.copy.primaryCta}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
