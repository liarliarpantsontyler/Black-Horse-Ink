"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildHeroGallerySequence } from "@/content/portfolio";
import type { PortfolioItem } from "@/content/schemas";
import { getArtistById, siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { trackEvent } from "@/lib/analytics";

const AUTO_SCROLL_PX_PER_SEC = 24;
const TAP_MOVE_THRESHOLD_PX = 8;

function hashTilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h % 900) / 100 - 4.5);
}

function hashFloatDelay(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) | 0;
  return (h % 4000) / 1000;
}

type GalleryTileProps = {
  item: PortfolioItem;
  dragExtraRotate: number;
  onTap: (item: PortfolioItem) => void;
};

function GalleryTile({ item, dragExtraRotate, onTap }: GalleryTileProps) {
  const tilt = hashTilt(item.id);
  const floatDelay = hashFloatDelay(item.id);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="hero-gallery-tile relative h-36 w-[108px] shrink-0 snap-center md:h-40 md:w-[120px]"
      style={{ animationDelay: `${floatDelay}s` }}
    >
      <button
        type="button"
        className="h-full w-full touch-pan-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ transform: `rotate(${tilt + dragExtraRotate}deg)` }}
        onPointerDown={(e) => {
          pointerStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.hypot(dx, dy) < TAP_MOVE_THRESHOLD_PX) {
            onTap(item);
          }
        }}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        aria-label={item.alt}
      >
        <span className="block h-full overflow-hidden rounded-xl border-2 border-white/90 bg-black/40 shadow-md">
          <Image
            src={item.image}
            alt=""
            width={360}
            height={480}
            className="h-full w-full object-cover"
            sizes="120px"
            draggable={false}
          />
        </span>
      </button>
    </div>
  );
}

export function HeroWorkGallery() {
  const sequence = useMemo(() => buildHeroGallerySequence(5), []);
  const trackItems = useMemo(
    () => [...sequence, ...sequence, ...sequence],
    [sequence],
  );
  const { openQuote } = useQuote();
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [dragExtraRotate, setDragExtraRotate] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const segmentWidthRef = useRef(0);
  const userInteractingRef = useRef(false);
  const lastPointerXRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const measureSegment = useCallback(() => {
    const el = scrollRef.current;
    if (!el || sequence.length === 0) return;
    segmentWidthRef.current = el.scrollWidth / 3;
  }, [sequence.length]);

  useLayoutEffect(() => {
    measureSegment();
    const el = scrollRef.current;
    if (!el || segmentWidthRef.current <= 0) return;
    el.scrollLeft = segmentWidthRef.current;
  }, [measureSegment, trackItems]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onResize = () => measureSegment();
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      const segment = segmentWidthRef.current;
      if (segment <= 0) return;
      const { scrollLeft } = el;
      const edge = segment * 0.05;
      if (scrollLeft <= edge) {
        el.scrollLeft = scrollLeft + segment;
      } else if (scrollLeft >= segment * 2 - edge) {
        el.scrollLeft = scrollLeft - segment;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      el.removeEventListener("scroll", onScroll);
    };
  }, [measureSegment]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const pause = () => {
      userInteractingRef.current = true;
    };
    const resume = () => {
      userInteractingRef.current = false;
      lastPointerXRef.current = null;
      setDragExtraRotate(0);
    };

    const onPointerDown = (e: PointerEvent) => {
      pause();
      lastPointerXRef.current = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (lastPointerXRef.current === null) return;
      const delta = e.clientX - lastPointerXRef.current;
      lastPointerXRef.current = e.clientX;
      setDragExtraRotate((r) => Math.max(-6, Math.min(6, r + delta * 0.08)));
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", resume);
    el.addEventListener("pointercancel", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    let wheelResumeTimer: ReturnType<typeof setTimeout>;
    const onWheel = () => {
      pause();
      clearTimeout(wheelResumeTimer);
      wheelResumeTimer = setTimeout(resume, 400);
    };
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("pointercancel", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("wheel", onWheel);
      clearTimeout(wheelResumeTimer);
    };
  }, []);

  useEffect(() => {
    const tick = (now: number) => {
      const el = scrollRef.current;
      if (el && !reduceMotionRef.current && !userInteractingRef.current) {
        const last = lastFrameTimeRef.current ?? now;
        const dt = (now - last) / 1000;
        el.scrollLeft += AUTO_SCROLL_PX_PER_SEC * dt;
      }
      lastFrameTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleTap(item: PortfolioItem) {
    trackEvent("hero_gallery_tap", { artist_id: item.artistId });
    setActive(item);
  }

  if (sequence.length === 0) return null;

  return (
    <>
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x" }}
        aria-label="Recent tattoo work"
      >
        {trackItems.map((item, i) => (
          <GalleryTile
            key={`${item.id}-${i}`}
            item={item}
            dragExtraRotate={dragExtraRotate}
            onTap={handleTap}
          />
        ))}
      </div>

      {active && (
        <ImageLightbox
          src={active.image}
          alt={active.alt}
          onClose={() => setActive(null)}
          quoteHint={`Tattoo by ${getArtistById(active.artistId)?.name ?? "Artist"}. ${siteConfig.copy.quoteLikeThisHint}`}
          onQuote={() => {
            setActive(null);
            openQuote(active.artistId);
          }}
        />
      )}
    </>
  );
}
