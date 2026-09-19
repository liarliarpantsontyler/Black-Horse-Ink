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
  const [visible, setVisible] = useState(true);
  const [logoVersion, setLogoVersion] = useState<1 | 2>(1);
  const lastScrollY = useRef(0);

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

  const isV2 = logoVersion === 2;

  return (
    <header
      className={[
        "sticky top-0 z-40 border-b shadow-sm transition-[transform,background-color,color,border-color] duration-300 ease-out will-change-transform",
        isV2
          ? "border-neutral-800 bg-black text-white"
          : "border-neutral-200/90 bg-white text-neutral-900",
        visible ? "translate-y-0" : "-translate-y-full md:translate-y-0",
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
