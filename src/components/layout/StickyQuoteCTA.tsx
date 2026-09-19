"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={20}
      height={20}
      aria-hidden
      className="shrink-0 text-black"
    >
      <line
        x1="40"
        y1="128"
        x2="216"
        y2="128"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
      <polyline
        points="144 56 216 128 144 200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
    </svg>
  );
}

export function StickyQuoteCTA() {
  const { isOpen, openQuote } = useQuote();
  if (isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Button
        type="button"
        fullWidth
        onClick={() => openQuote()}
        className="min-h-[3.25rem] gap-2.5 px-5 text-[20px] font-semibold leading-tight text-black hover:text-black/90"
      >
        {siteConfig.copy.stickyPrimaryCta}
        <ArrowRightIcon />
      </Button>
      <p className="mt-2 text-center text-sm text-muted">{siteConfig.copy.ctaSubtext}</p>
    </div>
  );
}
