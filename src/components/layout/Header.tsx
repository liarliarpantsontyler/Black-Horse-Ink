"use client";

import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { openQuote } = useQuote();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="font-display text-lg tracking-tight md:text-xl">
          {siteConfig.studio.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex" aria-label="Main">
          <a href="#artists" className="hover:text-foreground">
            Artists
          </a>
          <a href="#work" className="hover:text-foreground">
            Work
          </a>
          <a href="#location" className="hover:text-foreground">
            Visit
          </a>
        </nav>
        <Button
          type="button"
          className="hidden min-h-10 px-5 md:inline-flex"
          onClick={() => openQuote()}
        >
          {siteConfig.copy.primaryCta}
        </Button>
      </div>
    </header>
  );
}
