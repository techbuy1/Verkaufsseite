"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { ChevronRightIcon } from "./Icons";
import { CategoryProductCard } from "./CategoryProductCard";

interface CategoryProductCarouselProps {
  products: Product[];
}

/** Auto-advance interval — calm presentation pace. */
const AUTO_MS = 5200;

export function CategoryProductCarousel({ products }: CategoryProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const touchStartXRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const measureStep = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 280;
    if (stepRef.current > 0) return stepRef.current;
    const card = container.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = card?.offsetWidth ?? container.clientWidth * 0.7;
    const styles = window.getComputedStyle(container);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "12") || 12;
    stepRef.current = cardWidth + gap;
    return stepRef.current;
  }, []);

  const scrollByCards = useCallback(
    (direction: "prev" | "next") => {
      const container = scrollRef.current;
      if (!container) return;

      const delta = direction === "next" ? measureStep() : -measureStep();
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const nextLeft = container.scrollLeft + delta;

      if (direction === "next" && nextLeft >= maxScrollLeft - 4) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      if (direction === "prev" && nextLeft <= 4) {
        container.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
        return;
      }

      container.scrollBy({ left: delta, behavior: "smooth" });
    },
    [measureStep],
  );

  useEffect(() => {
    stepRef.current = 0;
  }, [products]);

  useEffect(() => {
    if (prefersReducedMotion || paused || !inView || products.length <= 1) return;

    const id = window.setInterval(() => {
      scrollByCards("next");
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [paused, inView, prefersReducedMotion, products.length, scrollByCards]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined) {
      setPaused(false);
      return;
    }

    const delta = startX - endX;
    if (Math.abs(delta) >= 40) {
      scrollByCards(delta > 0 ? "next" : "prev");
    }
    touchStartXRef.current = null;
    window.setTimeout(() => setPaused(false), 2500);
  };

  if (products.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => {
              setPaused(true);
              scrollByCards("prev");
              window.setTimeout(() => setPaused(false), 2500);
            }}
            className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-card text-text-secondary shadow-[var(--shadow-card)] transition-colors hover:text-text-primary md:flex lg:-left-4"
            aria-label="Vorherige Produkte"
          >
            <ChevronRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPaused(true);
              scrollByCards("next");
              window.setTimeout(() => setPaused(false), 2500);
            }}
            className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-card text-text-secondary shadow-[var(--shadow-card)] transition-colors hover:text-text-primary md:flex lg:-right-4"
            aria-label="Nächste Produkte"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory pb-1 sm:gap-3.5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Produktkarussell"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-card
            className="w-[72%] max-w-[240px] shrink-0 snap-start min-[480px]:w-[46%] min-[480px]:max-w-[260px] md:w-[31%] md:max-w-none lg:w-[23.5%]"
          >
            <CategoryProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
