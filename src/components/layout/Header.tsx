"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { LogoPreviewToggle } from "./LogoPreviewToggle";

const LOGO_V1 = "/images/logo-black-horse-ink.png";
const LOGO_V2 = "/images/logo-black-horse-ink-v2-lockup.png";
const LOGO_PREVIEW_KEY = "bhi_logo_preview";

export function Header() {
  const { openQuote } = useQuote();
  const [logoVersion, setLogoVersion] = useState<1 | 2>(1);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const hideOffsetRef = useRef(0);
  const headerHeightRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LOGO_PREVIEW_KEY);
      if (saved === "2") setLogoVersion(2);
    } catch {
      /* ignore */
    }
  }, []);

  function setLogoPreview(version: 1 | 2) {
    setLogoVersion(version);
    try {
      sessionStorage.setItem(LOGO_PREVIEW_KEY, String(version));
    } catch {
      /* ignore */
    }
  }

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

  const isV2 = logoVersion === 2;

  return (
    <header
      ref={headerRef}
      className={[
        "sticky top-0 z-40 border-b shadow-sm will-change-transform transition-[background-color,color,border-color,box-shadow] duration-300 ease-out md:translate-y-0",
        isV2
          ? "border-neutral-800 bg-black text-white"
          : "border-neutral-200/90 bg-white text-neutral-900",
      ].join(" ")}
    >
      <div className="relative mx-auto flex h-[5.5625rem] max-w-6xl items-center justify-center px-4 md:h-auto md:justify-between md:py-3 md:px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center md:justify-start"
          aria-label={`${siteConfig.studio.name} home`}
        >
          {isV2 ? (
            <Image
              src={LOGO_V2}
              alt=""
              width={1024}
              height={263}
              priority
              className="h-[5.25rem] w-auto max-w-[min(22rem,calc(100vw-7.5rem))] object-contain object-center md:h-14 md:max-w-[20rem]"
            />
          ) : (
            <Image
              src={LOGO_V1}
              alt=""
              width={1024}
              height={273}
              priority
              className="h-[4.25rem] w-auto max-w-[min(20rem,calc(100vw-7.5rem))] object-contain md:h-10 md:max-w-none"
            />
          )}
        </Link>

        <nav
          className={[
            "hidden items-center gap-6 text-sm md:flex",
            isV2 ? "text-neutral-400" : "text-neutral-600",
          ].join(" ")}
          aria-label="Main"
        >
          <a
            href="#artists"
            className={isV2 ? "hover:text-white" : "hover:text-neutral-900"}
          >
            Artists
          </a>
          <a
            href="#work"
            className={isV2 ? "hover:text-white" : "hover:text-neutral-900"}
          >
            Work
          </a>
          <a
            href="#location"
            className={isV2 ? "hover:text-white" : "hover:text-neutral-900"}
          >
            Visit
          </a>
        </nav>

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 md:static md:translate-y-0 md:gap-3">
          <LogoPreviewToggle
            value={logoVersion}
            onChange={setLogoPreview}
            inverted={isV2}
          />
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
