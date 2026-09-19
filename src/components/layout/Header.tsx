"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

const LOGO_SRC = "/images/logo-black-horse-ink.png";

export function Header() {
  const { openQuote } = useQuote();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const hideOffsetRef = useRef(0);
  const headerHeightRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const media = window.matchMedia("(max-width: 767px)");

    const measureHeader = () => {
      headerHeightRef.current = header.offsetHeight;
    };

    measureHeader();
    const ro = new ResizeObserver(measureHeader);
    ro.observe(header);

    const applyHideOffset = () => {
      const offset = hideOffsetRef.current;
      if (!media.matches) {
        header.style.transform = "";
        return;
      }
      header.style.transform = `translate3d(0, ${-offset}px, 0)`;
    };

    const scheduleApply = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        applyHideOffset();
      });
    };

    const onScroll = () => {
      if (!media.matches) {
        hideOffsetRef.current = 0;
        scheduleApply();
        return;
      }

      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      const maxHide = headerHeightRef.current;
      if (maxHide <= 0) {
        measureHeader();
        return;
      }

      if (y <= 8) {
        hideOffsetRef.current = 0;
      } else {
        hideOffsetRef.current = Math.max(
          0,
          Math.min(maxHide, hideOffsetRef.current + delta),
        );
      }

      scheduleApply();
    };

    const onMediaChange = () => {
      if (!media.matches) hideOffsetRef.current = 0;
      scheduleApply();
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      media.removeEventListener("change", onMediaChange);
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      header.style.transform = "";
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-neutral-200/90 bg-white text-neutral-900 shadow-sm will-change-transform transition-[background-color,color,border-color,box-shadow] duration-300 ease-out md:translate-y-0"
    >
      <div className="relative mx-auto flex h-[5.5625rem] max-w-6xl items-center justify-center px-4 md:h-auto md:justify-between md:py-3 md:px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center md:justify-start"
          aria-label={`${siteConfig.studio.name} home`}
        >
          <Image
            src={LOGO_SRC}
            alt=""
            width={1024}
            height={273}
            priority
            className="h-[4.25rem] w-auto max-w-[min(20rem,calc(100vw-7.5rem))] object-contain md:h-10 md:max-w-none"
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

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 md:static md:translate-y-0 md:gap-3">
          <div className="hidden md:block">
            <Button type="button" className="min-h-10 px-5" onClick={() => openQuote()}>
              {siteConfig.copy.primaryCta}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
