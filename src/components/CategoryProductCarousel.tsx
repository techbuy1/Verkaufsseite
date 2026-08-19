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
const AUTO_MS = 4200;

export function CategoryProductCarousel({ products }: CategoryProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollByCards = useCallback((direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = card?.offsetWidth ?? container.clientWidth * 0.7;
    const styles = window.getComputedStyle(container);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "12") || 12;
    const delta = direction === "next" ? cardWidth + gap : -(cardWidth + gap);

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextLeft = container.scrollLeft + delta;

    // Loop to start when reaching the end during auto-play
    if (direction === "next" && nextLeft >= maxScrollLeft - 4) {
      container.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === "prev" && nextLeft <= 4) {
      container.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    container.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || paused || products.length <= 1) return;

    const id = window.setInterval(() => {
      scrollByCards("next");
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, products.length, scrollByCards]);

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
