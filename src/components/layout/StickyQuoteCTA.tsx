"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";

const STICKY_SUBTEXT_EMPHASIS = "within minutes.";

export function StickyQuoteCTA() {
  const { isOpen, openQuote } = useQuote();
  if (isOpen) return null;

  const subtext = siteConfig.copy.stickySubtext;
  const emphasisIndex = subtext.lastIndexOf(STICKY_SUBTEXT_EMPHASIS);
  const subtextLead =
    emphasisIndex >= 0 ? subtext.slice(0, emphasisIndex) : subtext;
  const hasEmphasis = emphasisIndex >= 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <p className="mb-2 text-center text-sm text-black/80">
        {subtextLead}
        {hasEmphasis ? (
          <span className="font-bold">{STICKY_SUBTEXT_EMPHASIS}</span>
        ) : null}
      </p>
      <Button
        type="button"
        fullWidth
        onClick={() => openQuote()}
        className="min-h-[3.25rem] gap-2.5 px-5 text-[16px] font-semibold leading-tight text-black hover:text-black/90"
      >
        {siteConfig.copy.stickyPrimaryCta}
        <ArrowRightIcon className="shrink-0 text-black" />
      </Button>
    </div>
  );
}
