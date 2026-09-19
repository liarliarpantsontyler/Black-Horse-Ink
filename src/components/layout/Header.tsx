"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { openQuote } = useQuote();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    function onScroll() {
      if (!media.matches) {
        setVisible(true);
        return;
      }

      const y = window.scrollY;
      if (y <= 8) {
        setVisible(true);
      } else if (y > lastScrollY.current + 6) {
        setVisible(false);
      } else if (y < lastScrollY.current - 6) {
        setVisible(true);
      }
      lastScrollY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40 border-b border-neutral-200/90 bg-white text-neutral-900 shadow-sm transition-transform duration-300 ease-out will-change-transform",
        visible ? "translate-y-0" : "-translate-y-full md:translate-y-0",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[5.5625rem] max-w-6xl items-center justify-center px-4 md:h-auto md:justify-between md:py-3 md:px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center md:justify-start"
          aria-label={`${siteConfig.studio.name} home`}
        >
          <Image
            src="/images/logo-black-horse-ink.png"
            alt=""
            width={560}
            height={160}
            priority
            className="h-[4.25rem] w-auto object-contain md:h-10"
          />
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm text-neutral-600 md:flex"
          aria-label="Main"
        >
          <a href="#artists" className="hover:text-neutral-900">
            Artists
          </a>
          <a href="#work" className="hover:text-neutral-900">
            Work
          </a>
          <a href="#location" className="hover:text-neutral-900">
            Visit
          </a>
        </nav>

        <div className="hidden md:block">
          <Button type="button" className="min-h-10 px-5" onClick={() => openQuote()}>
            {siteConfig.copy.primaryCta}
          </Button>
        </div>
      </div>
    </header>
  );
}
