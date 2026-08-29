"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { featuredHighlightProducts } from "@/data/featuredHighlights";
import { formatPrice } from "@/data/products";
import { useProductStore } from "@/context/ProductStoreContext";
import { Reveal } from "../motion/Reveal";
import { SplitHeadline } from "../motion/SplitHeadline";
import { DeviceStage } from "./DeviceStage";
import { HIGHLIGHT_STAT_ICONS } from "./HighlightIcons";
import { HighlightWordCarousel } from "./HighlightWordCarousel";

export function FeaturedHighlights() {
  const prefersReducedMotion = useReducedMotion();
  const { getProductById, ready } = useProductStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const availableHighlights = useMemo(() => {
    void ready;
    return featuredHighlightProducts.filter((entry) => {
      const live = getProductById(entry.productId);
      return live ? live.inStock : false;
    });
  }, [getProductById, ready]);

  const safeIndex =
    availableHighlights.length === 0
      ? 0
      : Math.min(activeIndex, availableHighlights.length - 1);
  const active = availableHighlights[safeIndex];
  const product = active ? getProductById(active.productId) : undefined;
  const colors = useMemo(
    () =>
      (product?.colors ?? []).map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
        image: color.image,
      })),
    [product],
  );

  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(colors[0]?.id);
  const activeColorId = colors.some((color) => color.id === selectedColorId)
    ? selectedColorId
    : colors[0]?.id;
  const selectedColor = colors.find((color) => color.id === activeColorId) ?? colors[0];

  const storageOptions = useMemo(
    () => (product?.storageOptions ?? []).map((storage) => ({ storage })),
    [product],
  );
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined);
  const activeStorage = storageOptions.some((option) => option.storage === selectedStorage)
    ? selectedStorage
    : storageOptions[0]?.storage;

  useEffect(() => {
    setSelectedStorage(undefined);
  }, [activeColorId]);

  useEffect(() => {
    if (activeIndex >= availableHighlights.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, availableHighlights.length]);

  if (!active || !product || !selectedColor) return null;

  const price = product?.priceFrom ?? 0;

  function selectProduct(index: number) {
    if (index === safeIndex) return;
    setActiveIndex(index);
    setSelectedColorId(undefined);
    setSelectedStorage(undefined);
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F7F5_0%,#EFEFEC_100%)] pb-8 pt-14 md:pb-10 md:pt-16">
      {/* Soft background glow — colour shifts with the active product (micro only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-colors duration-700 ease-out"
        style={{
          background: `radial-gradient(640px circle at 18% 22%, ${active.glowColor}0a, transparent 58%), radial-gradient(520px circle at 88% 78%, ${active.glowColor}08, transparent 52%)`,
        }}
      />
      <div
        className="parallax-orb parallax-orb-a left-[-8%] top-[8%] h-[280px] w-[280px] opacity-[0.035]"
        style={{ background: active.glowColor }}
        aria-hidden="true"
      />
      <div
        className="parallax-orb parallax-orb-b bottom-[-10%] right-[-6%] h-[240px] w-[240px] opacity-[0.03]"
        style={{ background: "var(--color-techbuy-black)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
        <div className="mx-auto mb-7 max-w-[640px] text-center md:mb-9">
          <Reveal variant="fade" duration={0.5}>
            <span className="badge-techbuy mb-4 inline-flex">Highlights</span>
          </Reveal>
          <SplitHeadline
            as="h2"
            text="Entdecke die Highlights."
            delay={0.05}
            className="text-[32px] font-bold tracking-[-0.03em] text-text-primary md:text-[44px] lg:text-[48px]"
          />
          <Reveal variant="up-soft" delay={0.2}>
            <p className="mt-4 text-[17px] leading-relaxed text-text-secondary md:text-[19px]">
              Zwei Geräte im Detail — wechsle die Farbe und entdecke, was sie besonders macht.
            </p>
          </Reveal>
        </div>

        <Reveal variant="up-soft" delay={0.1} amount={0.4}>
          <div className="mb-6 flex justify-center md:mb-8">
            <div className="inline-flex rounded-full border border-border bg-surface-card p-1 shadow-[var(--shadow-card)]">
              {availableHighlights.map((entry, index) => {
                const isActive = index === safeIndex;
                return (
                  <button
                    key={entry.productId}
                    type="button"
                    onClick={() => selectProduct(index)}
                    aria-pressed={isActive}
                    className={`tap-feedback relative rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors duration-300 md:px-6 ${
                      isActive ? "text-white" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="highlight-tab-pill"
                        className="absolute inset-0 rounded-full bg-dark"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 32 }
                        }
                      />
                    )}
                    <span className="relative">{entry.eyebrow}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {active.carouselWords && active.carouselWords.length > 0 && (
          <Reveal variant="up-soft" delay={0.12} amount={0.3}>
            <div className="mb-6 md:mb-8">
              <HighlightWordCarousel
                key={active.productId}
                words={active.carouselWords}
                accentHex={selectedColor.hex}
              />
            </div>
          </Reveal>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={active.productId}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-12"
          >
            <div className="order-1 md:order-1">
              <DeviceStage
                image={selectedColor.image}
                alt={`${product.name} – ${selectedColor.name}`}
                hotspots={[]}
                accentColor={active.glowColor}
                showHotspots={false}
              />
            </div>

            <div className="order-2 flex flex-col items-center text-center md:order-2 md:items-start md:text-left">
              <Reveal variant="up" delay={0.05}>
                <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-accent">
                  {active.eyebrow}
                </p>
              </Reveal>

              <Reveal variant="up" delay={0.12}>
                <h3 className="mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-text-primary md:text-[38px]">
                  {active.headline}
                </h3>
              </Reveal>

              <Reveal variant="up-soft" delay={0.2}>
                <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
                  {active.stats.map((stat) => {
                    const Icon = HIGHLIGHT_STAT_ICONS[stat.icon];
                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border bg-surface-card/80 px-3 py-3.5 text-center md:text-left"
                      >
                        <Icon className="mx-auto h-5 w-5 text-accent md:mx-0" />
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                          {stat.label}
                        </p>
                        <p className="text-[13px] font-semibold text-text-primary">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              <Reveal variant="up-soft" delay={0.28}>
                <div className="mt-7 flex flex-col items-center gap-3 md:items-start">
                  <p className="text-[13px] font-medium text-text-secondary">
                    Farbe · {selectedColor.name}
                  </p>
                  <div className="flex items-center gap-2.5">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={`Farbe ${color.name}`}
                        aria-pressed={color.id === activeColorId}
                        onClick={() => setSelectedColorId(color.id)}
                        className={`h-8 w-8 rounded-full transition-transform duration-200 ${
                          color.id === activeColorId
                            ? "swatch-ring-active scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>

              {storageOptions.length > 1 && (
                <Reveal variant="up-soft" delay={0.32}>
                  <div className="mt-5 flex flex-col items-center gap-3 md:items-start">
                    <p className="text-[13px] font-medium text-text-secondary">Speicher</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      {storageOptions.map((option) => (
                        <button
                          key={option.storage}
                          type="button"
                          aria-pressed={option.storage === activeStorage}
                          onClick={() => setSelectedStorage(option.storage)}
                          className={`tap-feedback rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                            option.storage === activeStorage
                              ? "border-accent bg-accent text-white"
                              : "border-border bg-surface-card text-text-primary hover:bg-surface-hover"
                          }`}
                        >
                          {option.storage}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              <Reveal variant="up-soft" delay={0.34}>
                <p className="mt-6 text-[15px] text-text-secondary">Ab</p>
              </Reveal>
              <Reveal variant="up-soft" delay={0.36}>
                <p className="text-[28px] font-semibold tracking-tight text-text-primary md:text-[32px]">
                  {formatPrice(price)}
                </p>
              </Reveal>

              <Reveal variant="up-soft" delay={0.42}>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <Link href={`/products/${active.slug}`} className="btn-techbuy-primary px-7">
                    Kaufen
                  </Link>
                  <Link
                    href={`/products/${active.slug}`}
                    className="btn-techbuy-secondary px-7"
                  >
                    Mehr erfahren
                  </Link>
                </div>
              </Reveal>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Smooth handoff into the category section below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-background-secondary" />
    </section>
  );
}
