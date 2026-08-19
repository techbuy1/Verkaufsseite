"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { featuredHighlightProducts } from "@/data/featuredHighlights";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import { resolvePremiumProduct } from "@/lib/catalog";
import { getProductPrice, getStorageOptionsForColor } from "@/lib/productVariants";
import { Magnetic } from "./motion/Magnetic";
import { Reveal } from "./motion/Reveal";
import { AuroraStage } from "./premiumDrop/AuroraStage";
import { FloatingSpecPills } from "./premiumDrop/FloatingSpecPills";
import { LightTrail } from "./premiumDrop/LightTrail";
import { ColorTransition } from "./whyTechBuy/ColorTransition";

const EASE = [0.16, 1, 0.3, 1] as const;

// Three.js/R3F only ever load once this section is actually reached — the
// homepage bundle stays lean for visitors who never scroll this far.
const DeviceViewer3D = dynamic(
  () => import("./product3d/DeviceViewer3D").then((mod) => mod.DeviceViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[3/4] w-full max-w-[360px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
      </div>
    ),
  },
);

const PILL_POSITIONS = [
  [
    { top: "6%", left: "0%" },
    { top: "46%", right: "-2%" },
    { top: "82%", left: "6%" },
  ],
  [
    { top: "8%", right: "-2%" },
    { top: "48%", left: "-2%" },
    { top: "80%", right: "8%" },
  ],
];

function PremiumDropHeadline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-[720px] text-center">
      <motion.span
        className="mb-5 inline-flex rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        TechBuy Premium Drop
      </motion.span>

      <h2 className="text-[30px] font-bold leading-[1.15] tracking-[-0.03em] text-white md:text-[44px] lg:text-[50px]">
        <motion.span
          className="block"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          Die neuesten Flaggschiffe.
        </motion.span>
        <span className="relative mt-1 block overflow-hidden py-1" aria-hidden="true">
          <motion.span
            className="wtb-gradient-text inline-block font-bold"
            initial={prefersReducedMotion ? undefined : { y: "115%" }}
            whileInView={prefersReducedMotion ? undefined : { y: "0%" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.15 }}
          >
            Bereit für dich.
          </motion.span>
        </span>
        <span className="sr-only">Bereit für dich.</span>
      </h2>

      <Reveal variant="up-soft" delay={0.3}>
        <p className="mt-5 text-[16px] leading-relaxed text-white/60 md:text-[18px]">
          Zwei Highlights, ein Drop — dreh sie in 3D, wechsle Farbe und Speicher und hol dir dein
          nächstes Gerät zum echten TechBuy-Preis.
        </p>
      </Reveal>
    </div>
  );
}

export function PremiumBanner() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(undefined);
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined);
  const [dragHintVisible, setDragHintVisible] = useState(true);
  const [viewerOpenSignal, setViewerOpenSignal] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const impulseFired = useRef(false);
  const [impulseActive, setImpulseActive] = useState(false);

  const active = featuredHighlightProducts[activeIndex];
  const product = resolvePremiumProduct(active.productId);
  const colors = useMemo(() => getColorDefinitionsForSlug(active.slug) ?? [], [active.slug]);
  const activeColorId = colors.some((color) => color.id === selectedColorId)
    ? selectedColorId
    : colors[0]?.id;
  const selectedColor = colors.find((color) => color.id === activeColorId) ?? colors[0];

  const storageOptions = useMemo(
    () => (product && activeColorId ? getStorageOptionsForColor(product, activeColorId) : []),
    [product, activeColorId],
  );
  const activeStorage = storageOptions.some((option) => option.storage === selectedStorage)
    ? selectedStorage
    : storageOptions[0]?.storage;

  useEffect(() => {
    setSelectedStorage(undefined);
  }, [activeColorId]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progressScaleX = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (impulseFired.current || prefersReducedMotion) return;
    if (value > 0.42 && value < 0.75) {
      impulseFired.current = true;
      setImpulseActive(true);
      window.setTimeout(() => setImpulseActive(false), 1200);
    }
  });

  if (!product || !selectedColor) return null;

  const price = activeStorage ? getProductPrice(product, activeStorage, activeColorId) : 0;

  function selectProduct(index: number) {
    const clamped = Math.max(0, Math.min(featuredHighlightProducts.length - 1, index));
    if (clamped === activeIndex) return;
    setActiveIndex(clamped);
    setSelectedColorId(undefined);
    setSelectedStorage(undefined);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    selectProduct(activeIndex + (delta < 0 ? 1 : -1));
  }

  function handleStageInteract() {
    if (dragHintVisible) setDragHintVisible(false);
  }

  const pillPositions = PILL_POSITIONS[activeIndex] ?? PILL_POSITIONS[0];

  return (
    <>
      <ColorTransition />

      <section
        ref={sectionRef}
        className="relative overflow-hidden bg-[#07110d] pb-6 pt-10 md:pb-8 md:pt-14"
      >
        <AuroraStage sectionRef={sectionRef} />

        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute left-0 top-0 z-20 h-[2px] w-full origin-left bg-gradient-to-r from-[#16c66a] via-[#5eead4] to-[#38bdf8]"
            style={{ scaleX: progressScaleX }}
          />
        )}

        {!prefersReducedMotion && (
          <AnimatePresence>
            {impulseActive && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  background:
                    "radial-gradient(55% 45% at 50% 38%, rgba(94,234,212,0.4), transparent 72%)",
                }}
              />
            )}
          </AnimatePresence>
        )}

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-10 lg:px-12">
          <div className="mb-8 md:mb-10">
            <PremiumDropHeadline />
          </div>

          <Reveal variant="up-soft" delay={0.1} amount={0.4}>
            <div className="mb-6 flex justify-center md:mb-8">
              <div className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.04] p-1 backdrop-blur-md">
                {featuredHighlightProducts.map((entry, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={entry.productId}
                      type="button"
                      onClick={() => selectProduct(index)}
                      aria-pressed={isActive}
                      className={`tap-feedback relative rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors duration-300 md:px-6 ${
                        isActive ? "text-[#07110d]" : "text-white/60 hover:text-white/90"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="premium-drop-tab-pill"
                          className="absolute inset-0 rounded-full bg-white"
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

          <AnimatePresence mode="wait">
            <motion.div
              key={active.productId}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-8 lg:gap-12"
            >
              <div className="relative order-1 md:order-1">
                {!prefersReducedMotion && <LightTrail />}
                <div
                  ref={stageRef}
                  className="relative mx-auto aspect-[3/4] w-full max-w-[380px]"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onPointerDown={handleStageInteract}
                >
                  <DeviceViewer3D
                    key={active.productId}
                    modelPath={active.modelPath ?? ""}
                    colorHex={selectedColor.hex}
                    accentColor={active.glowColor}
                    fallbackImage={selectedColor.image}
                    fallbackImageAlt={`${product.name} – ${selectedColor.name}`}
                    screenTextureUrl={selectedColor.wallpaper}
                    colorModelPath={selectedColor.model}
                    className="h-full w-full"
                    hideControls
                    openSignal={viewerOpenSignal}
                  />

                  {active.pillLabels && (
                    <FloatingSpecPills specs={active.pillLabels} positions={pillPositions} />
                  )}

                  <AnimatePresence>
                    {dragHintVisible && (
                      <motion.div
                        className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.4 }}
                      >
                        <span className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/40 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/60 backdrop-blur-md">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Ziehen zum Entdecken
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="order-2 flex flex-col items-center text-center md:order-2 md:items-start md:text-left">
                <Reveal variant="up" delay={0.05}>
                  <p
                    className="text-[13px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: active.glowColor }}
                  >
                    {active.eyebrow}
                  </p>
                </Reveal>

                <Reveal variant="up" delay={0.12}>
                  <h3 className="mt-2 text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-[32px]">
                    {active.headline}
                  </h3>
                </Reveal>

                {colors.length > 1 && (
                  <Reveal variant="up-soft" delay={0.2}>
                    <div className="mt-6 flex flex-col items-center gap-3 md:items-start">
                      <p className="text-[13px] font-medium text-white/50">
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
                            className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-[#07110d] transition-transform duration-200 ${
                              color.id === activeColorId
                                ? "scale-110 ring-2 ring-white/70"
                                : "hover:scale-110"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                {storageOptions.length > 1 && (
                  <Reveal variant="up-soft" delay={0.26}>
                    <div className="mt-5 flex flex-col items-center gap-3 md:items-start">
                      <p className="text-[13px] font-medium text-white/50">Speicher</p>
                      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        {storageOptions.map((option) => (
                          <button
                            key={option.storage}
                            type="button"
                            aria-pressed={option.storage === activeStorage}
                            onClick={() => setSelectedStorage(option.storage)}
                            className={`tap-feedback rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                              option.storage === activeStorage
                                ? "border-white bg-white text-[#07110d]"
                                : "border-white/[0.15] text-white/60 hover:border-white/40 hover:text-white"
                            }`}
                          >
                            {option.storage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                <Reveal variant="up-soft" delay={0.32}>
                  <p className="mt-7 text-[14px] text-white/50">Ab</p>
                </Reveal>
                <Reveal variant="up-soft" delay={0.34}>
                  <p className="text-[28px] font-semibold tracking-tight text-white md:text-[32px]">
                    {formatPrice(price)}
                  </p>
                </Reveal>

                <Reveal variant="up-soft" delay={0.4}>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                    <Magnetic strength={0.25} className="inline-block">
                      <Link
                        href={`/products/${active.slug}`}
                        className="tap-feedback inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-7 text-[14px] font-medium text-[#07110d] transition-colors duration-300 hover:bg-white/90"
                      >
                        Jetzt entdecken
                      </Link>
                    </Magnetic>
                    <button
                      type="button"
                      onClick={() => setViewerOpenSignal((value) => value + 1)}
                      className="tap-feedback inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.18] px-7 text-[14px] font-medium text-white/85 transition-colors duration-300 hover:border-white/40 hover:text-white"
                    >
                      360° ansehen
                    </button>
                  </div>
                </Reveal>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
