"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  catalogCategories,
  type CatalogCategoryId,
} from "@/data/catalogCategories";
import { getHomepageProductsByCategory, getProductById } from "@/data/products";
import { useProductStore } from "@/context/ProductStoreContext";
import { sortProducts } from "@/lib/filterProducts";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CategoryProductCarousel } from "./CategoryProductCarousel";
import { Reveal } from "./motion/Reveal";
import { SplitHeadline } from "./motion/SplitHeadline";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT_CATEGORY: CatalogCategoryId = "smartphones";

/** Words cycling right before "passt" in the subtitle — all read naturally as "… <word> zu dir passt." */
const FIT_WORDS = ["wirklich", "perfekt", "genau", "optimal", "einfach"] as const;
const FIT_WORD_INTERVAL_MS = 2200;

function isCatalogCategoryId(value: string): value is CatalogCategoryId {
  return catalogCategories.some((category) => category.id === value);
}

function RotatingFitWord({ reducedMotion }: { reducedMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % FIT_WORDS.length);
    }, FIT_WORD_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const word = FIT_WORDS[index];

  return (
    <span
      className="relative inline-grid overflow-hidden align-bottom"
      style={{ minWidth: "5.1em" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="col-start-1 row-start-1 font-semibold text-accent"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Minimal line icons per category — self-contained here since no shared category-icon set exists yet. */
const CATEGORY_ICON_PATHS: Record<CatalogCategoryId, string> = {
  smartphones: "M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM10.5 18.2h3",
  tablets: "M5.5 3.5h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1ZM11.3 18.2h1.4",
  macbooks: "M4 16.5h16M6.5 16.5V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10.5M3 19.2h18",
  laptops: "M5 6.5h14a1 1 0 0 1 1 1V16H4V7.5a1 1 0 0 1 1-1ZM2.5 16h19l-1.4 2.7a1 1 0 0 1-.9.5H4.8a1 1 0 0 1-.9-.5L2.5 16Z",
  smartwatches: "M8.7 8h6.6l.7 2.2a3.8 3.8 0 0 1 0 3.6l-.7 2.2H8.7l-.7-2.2a3.8 3.8 0 0 1 0-3.6L8.7 8ZM9.5 8 9 4.6a1 1 0 0 1 1-1.1h4a1 1 0 0 1 1 1.1L14.5 8M9.5 16l-.5 3.4a1 1 0 0 0 1 1.1h4a1 1 0 0 0 1-1.1L14.5 16",
  audio: "M4 15v-3a8 8 0 0 1 16 0v3M4 15a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1Zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1Z",
  zubehoer: "M14.5 3 5 12.5l1.7 1.7L16.2 4.7 14.5 3ZM9.5 21 19 11.5l-1.7-1.7L7.8 19.3 9.5 21ZM3 6l1.5 1.5M18.5 16.5 20 18",
} as const;

function CategoryTabIcon({ id, className }: { id: CatalogCategoryId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d={CATEGORY_ICON_PATHS[id]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryProductSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  const prefersReducedMotion = useReducedMotion();
  const { products: storeProducts, ready } = useProductStore();
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategoryId>(DEFAULT_CATEGORY);

  const selectCategory = useCallback((categoryId: CatalogCategoryId) => {
    setActiveCategory(categoryId);
    window.history.replaceState(null, "", `#${categoryId}`);
  }, []);

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash && isCatalogCategoryId(hash)) {
        setActiveCategory(hash);
      }
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const activeConfig =
    catalogCategories.find((category) => category.id === activeCategory) ??
    catalogCategories[0];

  // Homepage: nur Geräte mit Bestand (reaktiv auf Admin-Store).
  const products = useMemo(() => {
    void ready;
    void storeProducts;
    return sortProducts(
      getHomepageProductsByCategory(activeCategory).map(
        (product) => getProductById(product.id) ?? product,
      ),
      "recommended",
    );
  }, [activeCategory, ready, storeProducts]);

  return (
    <section
      ref={ref}
      id="kategorien"
      className="relative scroll-mt-[80px] overflow-hidden bg-background-secondary pb-10 pt-6 text-text-primary md:pb-14 md:pt-8 lg:pb-16 lg:pt-10"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className={`absolute left-[-8%] top-[-6%] h-[220px] w-[220px] rounded-full bg-accent/[0.05] blur-[50px] md:h-[280px] md:w-[280px] ${
            prefersReducedMotion ? "" : "parallax-orb-a"
          }`}
        />
        <div
          className={`absolute bottom-[-14%] right-[-6%] h-[200px] w-[200px] rounded-full bg-accent/[0.035] blur-[45px] md:h-[260px] md:w-[260px] ${
            prefersReducedMotion ? "" : "parallax-orb-b"
          }`}
        />
      </div>

      <div
        className={`relative z-10 mx-auto max-w-[1400px] px-6 transition-all duration-700 ease-out md:px-10 lg:px-12 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[15px] opacity-0"
        }`}
      >
        <div className="mx-auto mb-6 max-w-[760px] text-center md:mb-8">
          <SplitHeadline
            as="h2"
            text="Entdecke unsere Kategorien"
            className="text-[32px] font-bold tracking-[-0.03em] md:text-[44px] lg:text-[52px]"
          />
          <Reveal variant="up-soft" delay={0.15}>
            <p className="mt-4 text-[17px] leading-relaxed text-text-secondary md:text-[19px]">
              Finde die Technik, die{" "}
              <RotatingFitWord reducedMotion={Boolean(prefersReducedMotion)} /> zu dir passt.
            </p>
          </Reveal>
        </div>

        <div className="mb-6 border-b border-border md:mb-8">
          <div className="scrollbar-hide -mx-6 flex items-center justify-start gap-2 overflow-x-auto px-6 pb-4 md:mx-0 md:justify-center md:gap-3 md:px-0">
            {catalogCategories.map((category, index) => {
              const isActive = category.id === activeCategory;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : isVisible
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 10 }
                  }
                  transition={{ duration: 0.45, delay: 0.1 + index * 0.05, ease: EASE }}
                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                  className={`tap-feedback relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-colors md:text-[15px] ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="category-tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-accent-soft"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <CategoryTabIcon
                    id={category.id}
                    className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-accent" : "text-text-secondary/70"}`}
                  />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 md:mb-6">
              <h3 className="text-[28px] font-semibold tracking-[-0.02em] text-text-primary md:text-[36px]">
                {activeConfig.headline}
              </h3>
              <p className="mt-2 text-[16px] text-text-secondary md:text-[18px]">
                {activeConfig.subheadline}
              </p>
            </div>

            <CategoryProductCarousel products={products} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
