"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

export function StickyQuoteCTA() {
  const { isOpen, openQuote } = useQuote();
  if (isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <Button type="button" fullWidth onClick={() => openQuote()}>
        {siteConfig.copy.primaryCta}
      </Button>
      <p className="mt-2 text-center text-xs text-muted">{siteConfig.copy.ctaSubtext}</p>
    </div>
  );
}
