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
import { getArtistById } from "@/content/site.config";
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
      className="hero-gallery-tile relative h-[19.5rem] w-[234px] shrink-0 md:h-[22.5rem] md:w-[270px]"
      style={{ animationDelay: `${floatDelay}s` }}
    >
      <button
        type="button"
        className="h-full w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            width={540}
            height={720}
            className="h-full w-full object-cover"
            sizes="(max-width:768px) 234px, 270px"
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

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollXRef = useRef(0);
  const segmentWidthRef = useRef(0);
  const userInteractingRef = useRef(false);
  const lastPointerXRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const touchAxisRef = useRef<"x" | "y" | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchLastXRef = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-scrollXRef.current}px, 0, 0)`;
  }, []);

  const normalizeScroll = useCallback(() => {
    const segment = segmentWidthRef.current;
    if (segment > 0) {
      const edge = segment * 0.05;
      if (scrollXRef.current <= edge) {
        scrollXRef.current += segment;
      } else if (scrollXRef.current >= segment * 2 - edge) {
        scrollXRef.current -= segment;
      }
    }
    applyTransform();
  }, [applyTransform]);

  const measureSegment = useCallback(() => {
    const track = trackRef.current;
    if (!track || sequence.length === 0) return;
    segmentWidthRef.current = track.offsetWidth / 3;
  }, [sequence.length]);

  useLayoutEffect(() => {
    measureSegment();
    const segment = segmentWidthRef.current;
    if (segment <= 0) return;
    scrollXRef.current = segment;
    applyTransform();
  }, [measureSegment, trackItems, applyTransform]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      measureSegment();
      if (segmentWidthRef.current > 0 && scrollXRef.current === 0) {
        scrollXRef.current = segmentWidthRef.current;
      }
      normalizeScroll();
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [measureSegment, normalizeScroll, trackItems]);

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
    const onResize = () => {
      measureSegment();
      normalizeScroll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureSegment, normalizeScroll]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const resume = () => {
      userInteractingRef.current = false;
      lastPointerXRef.current = null;
      touchAxisRef.current = null;
      touchLastXRef.current = null;
      setDragExtraRotate(0);
    };

    const panHorizontal = (deltaX: number) => {
      scrollXRef.current -= deltaX;
      setDragExtraRotate((r) => Math.max(-6, Math.min(6, r + deltaX * 0.08)));
      normalizeScroll();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      userInteractingRef.current = true;
      lastPointerXRef.current = e.clientX;
      viewport.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (lastPointerXRef.current === null) return;
      const deltaX = e.clientX - lastPointerXRef.current;
      lastPointerXRef.current = e.clientX;
      panHorizontal(deltaX);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
      resume();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      userInteractingRef.current = true;
      touchAxisRef.current = null;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchLastXRef.current = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || touchLastXRef.current === null) return;
      const touch = e.touches[0];
      const fromStartX = touch.clientX - touchStartXRef.current;
      const fromStartY = touch.clientY - touchStartYRef.current;

      if (touchAxisRef.current === null) {
        if (Math.hypot(fromStartX, fromStartY) < 8) return;
        touchAxisRef.current =
          Math.abs(fromStartX) >= Math.abs(fromStartY) ? "x" : "y";
      }

      if (touchAxisRef.current === "x") {
        e.preventDefault();
        const deltaX = touch.clientX - touchLastXRef.current;
        panHorizontal(deltaX);
      }

      touchLastXRef.current = touch.clientX;
    };

    const onTouchEnd = () => {
      resume();
    };

    let wheelResumeTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteractingRef.current = true;
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollXRef.current += delta;
      normalizeScroll();
      clearTimeout(wheelResumeTimer);
      wheelResumeTimer = setTimeout(resume, 400);
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });
    viewport.addEventListener("touchend", onTouchEnd);
    viewport.addEventListener("touchcancel", onTouchEnd);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      viewport.removeEventListener("touchcancel", onTouchEnd);
      viewport.removeEventListener("wheel", onWheel);
      clearTimeout(wheelResumeTimer);
    };
  }, [normalizeScroll]);

  useEffect(() => {
    const tick = (now: number) => {
      if (segmentWidthRef.current <= 0) {
        measureSegment();
      }
      if (!reduceMotionRef.current && !userInteractingRef.current) {
        const last = lastFrameTimeRef.current ?? now;
        const dt = Math.min((now - last) / 1000, 0.1);
        scrollXRef.current += AUTO_SCROLL_PX_PER_SEC * dt;
      }
      normalizeScroll();
      lastFrameTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [normalizeScroll, measureSegment]);

  function handleTap(item: PortfolioItem) {
    trackEvent("hero_gallery_tap", { artist_id: item.artistId });
    setActive(item);
  }

  if (sequence.length === 0) return null;

  return (
    <>
      <div className="hero-gallery-outer -mx-4">
        <div
          ref={viewportRef}
          className="hero-gallery-viewport overflow-visible px-4 py-4 md:py-5"
          aria-label="Recent tattoo work"
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-4 will-change-transform md:gap-5"
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
        </div>
      </div>

      {active && (
        <ImageLightbox
          src={active.image}
          alt={active.alt}
          onClose={() => setActive(null)}
          artistName={getArtistById(active.artistId)?.name ?? "Artist"}
          onQuote={() => {
            setActive(null);
            openQuote(active.artistId);
          }}
        />
      )}
    </>
  );
}
