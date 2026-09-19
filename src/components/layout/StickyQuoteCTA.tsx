"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";

export function StickyQuoteCTA() {
  const { isOpen, openQuote } = useQuote();
  if (isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Button
        type="button"
        fullWidth
        onClick={() => openQuote()}
        className="min-h-[3.25rem] gap-2.5 px-5 text-[18px] font-semibold leading-tight text-black hover:text-black/90"
      >
        {siteConfig.copy.stickyPrimaryCta}
        <ArrowRightIcon className="shrink-0 text-black" />
      </Button>
      <p className="mt-2 text-center text-sm font-medium leading-snug text-response-highlight">
        {siteConfig.copy.responseTimeCopy}
      </p>
      <p className="mt-1 text-center text-sm text-muted">{siteConfig.copy.stickySubtext}</p>
    </div>
  );
}
