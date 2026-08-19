"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroProduct as HeroProductType } from "@/types/hero";
import { HERO_SLIDE_INTERVAL_MS } from "@/data/heroSlides";
import { CampaignHeroRow } from "./CampaignHeroRow";
import { ChevronRightIcon } from "./Icons";

interface HeroCarouselProps {
  slides: HeroProductType[];
  onBuy?: (slide: HeroProductType) => void;
}

const TRANSITION_MS = 550;
const SWIPE_THRESHOLD_PX = 50;

export function HeroCarousel({ slides, onBuy }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [richIntro, setRichIntro] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const slideCount = slides.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setRichIntro(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const transitionTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;

      const nextIndex = (index + slideCount) % slideCount;
      if (nextIndex === activeIndex) return;

      if (reduceMotion) {
        setActiveIndex(nextIndex);
        setSlideVisible(true);
        return;
      }

      clearTransitionTimer();
      setSlideVisible(false);

      transitionTimerRef.current = window.setTimeout(() => {
        setActiveIndex(nextIndex);
        requestAnimationFrame(() => setSlideVisible(true));
      }, TRANSITION_MS / 2);
    },
    [activeIndex, clearTransitionTimer, reduceMotion, slideCount],
  );

  const goToNext = useCallback(() => {
    transitionTo(activeIndex + 1);
  }, [activeIndex, transitionTo]);

  const goToPrev = useCallback(() => {
    transitionTo(activeIndex - 1);
  }, [activeIndex, transitionTo]);

  useEffect(() => {
    return () => clearTransitionTimer();
  }, [clearTransitionTimer]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused || reduceMotion) return;

    const timer = window.setInterval(goToNext, HERO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goToNext, isPaused, reduceMotion, slideCount, activeIndex]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;

    if (startX === null || endX === undefined) return;

    const delta = startX - endX;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

    if (delta > 0) {
      goToNext();
    } else {
      goToPrev();
    }

    touchStartXRef.current = null;
  };

  if (slideCount === 0) return null;

  const safeIndex = activeIndex >= slideCount ? 0 : activeIndex;
  const activeSlide = slides[safeIndex];
  if (!activeSlide) return null;
  const transitionClass = reduceMotion ? "" : "transition-all duration-500 ease-out";

  return (
    <div
      ref={carouselRef}
      className="relative overflow-hidden"
      style={{ background: activeSlide.themeBackground ?? "var(--color-surface-hero)" }}
      role="region"
      aria-roledescription="Karussell"
      aria-label="Premium Highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!carouselRef.current?.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`${transitionClass} ${
          slideVisible
            ? "scale-100 opacity-100"
            : reduceMotion
              ? "opacity-100"
              : "scale-[0.985] opacity-0"
        }`}
      >
        <CampaignHeroRow
          key={activeSlide.id}
          product={activeSlide}
          onBuy={() => onBuy?.(activeSlide)}
          imagePosition="right"
          priority={activeIndex === 0}
          richIntro={richIntro}
          scrollReveal={false}
        />
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-white/90 p-3 text-text-secondary shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-colors hover:border-accent hover:text-accent md:left-6 md:flex"
            aria-label="Vorheriger Slide"
          >
            <ChevronRightIcon className="h-5 w-5 rotate-180" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border bg-white/90 p-3 text-text-secondary shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-colors hover:border-accent hover:text-accent md:right-6 md:flex"
            aria-label="Nächster Slide"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-7">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => transitionTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "h-2 w-8 bg-accent"
                    : "h-2 w-2 bg-text-secondary/30 hover:bg-text-secondary/50"
                }`}
                aria-label={`${slide.name} anzeigen`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
