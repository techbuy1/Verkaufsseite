"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { useGLTF } from "@react-three/drei";
import { Button } from "@/components/Button";
import { ChevronRightIcon } from "@/components/Icons";
import { HeroDeviceModel } from "@/components/hero/HeroDeviceModel";
import type { BrandHeroSlide } from "@/data/brandHeroDevices";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import { isColorAvailable, isProductAvailable } from "@/lib/productAvailability";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeadline } from "@/components/motion/SplitHeadline";

// Some of these GLBs run ~24MB — generous enough that, combined with the
// background preload below, a slide has almost always finished loading
// (and had a moment to actually be seen) before rotation moves past it.
const ROTATE_MS = 8000;

interface BrandHero3DCarouselProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaHref: string;
  ctaLabel: string;
  candidates: BrandHeroSlide[];
}

/**
 * Per-brand hero: cycles through real GLB-rendered devices (same 3D system
 * the homepage hero and product pages use), filtered down to whatever is
 * actually in stock right now — nothing sold out gets shown.
 */
export function BrandHero3DCarousel({
  eyebrow,
  headline,
  subheadline,
  ctaHref,
  ctaLabel,
  candidates,
}: BrandHero3DCarouselProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const [ready, setReady] = useState(false);
  const [slides, setSlides] = useState<BrandHeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const inStock = candidates.filter((candidate) => {
      const product = resolvePremiumProductBySlug(candidate.slug);
      if (!product) return false;
      return candidate.colorId
        ? isColorAvailable(product, candidate.colorId)
        : isProductAvailable(product);
    });
    setSlides(inStock);
    setReady(true);
  }, [candidates]);

  // Warm the GLTF cache for every candidate right away, in the background —
  // the first slide still pays a real network cost, but by the time
  // rotation reaches slide 2/3/4 they're typically already cached.
  useEffect(() => {
    for (const candidate of candidates) {
      useGLTF.preload(candidate.colorModelPath ?? candidate.modelPath);
    }
  }, [candidates]);

  useEffect(() => {
    if (slides.length <= 1 || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, prefersReducedMotion]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  // Nothing rendered until we know real stock — avoids flashing a device
  // that turns out to be sold out, and nothing at all if none is in stock.
  if (ready && slides.length === 0) return null;

  const active = slides[activeIndex] ?? candidates[0];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfbfd_0%,#f5f5f7_100%)] pt-14">
      <div
        className="pointer-events-none absolute left-1/2 top-[10%] h-[52vw] max-h-[480px] w-[52vw] max-w-[480px] -translate-x-1/2 rounded-full opacity-[0.15] blur-[90px] transition-[background] duration-700"
        style={{ background: active.glowColor }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-4 px-5 py-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-8 md:px-8 md:py-16 lg:px-10">
        <div className="order-1 flex flex-col items-start text-left">
          <Reveal variant="fade" duration={0.5} mode="mount">
            <span className="badge-techbuy mb-3">{eyebrow}</span>
          </Reveal>

          <SplitHeadline
            as="h1"
            text={headline}
            delay={0.1}
            wordDelay={0.06}
            mode="mount"
            className="mb-4 text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-text-primary md:text-[44px] lg:text-[52px]"
          />

          <Reveal variant="up-soft" duration={0.6} delay={0.32} mode="mount">
            <p className="mb-6 max-w-[420px] text-[15px] leading-relaxed text-text-secondary md:text-[17px]">
              {subheadline}
            </p>
          </Reveal>

          <Reveal variant="up-soft" duration={0.6} delay={0.44} mode="mount">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="hero-primary" href={ctaHref} className="group">
                {ctaLabel}
                <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-secondary" href="/compare">
                Modelle vergleichen
              </Button>
            </div>
          </Reveal>
        </div>

        <div
          className="order-2 relative h-[300px] select-none touch-pan-y sm:h-[360px] md:h-[420px] lg:h-[460px]"
          style={{ perspective: 1400 }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {/*
           * One persistent HeroDeviceModel instance — only its props change
           * as `active` rotates. Keying/remounting the whole tree here (e.g.
           * via AnimatePresence) tears down and rebuilds the Canvas every
           * rotation, and the new WebGL context loses the size its
           * ResizeObserver measured before the old one's layout had
           * committed, freezing it at R3F's 300×150 default. DeviceViewer3D
           * already crossfades between models internally (its own loading
           * overlay), so a stable instance here is both correct and simpler.
           */}
          <div className="absolute" style={{ left: "50%", top: "50%" }}>
            <HeroDeviceModel
              slug={active.slug}
              ariaLabel={`${active.model} ${active.colorName} entdecken`}
              modelPath={active.modelPath}
              colorModelPath={active.colorModelPath}
              colorHex={active.colorHex}
              fallbackImage={active.fallbackImage}
              fallbackImageAlt={`${active.model} ${active.colorName}`}
              glowColor={active.glowColor}
              floatDuration={10}
              floatDelay={0}
              sizeClassName="w-[200px] sm:w-[240px] md:w-[290px] lg:w-[320px]"
              zIndex={10}
              reducedMotion={prefersReducedMotion}
              pointerX={pointerX}
              pointerY={pointerY}
              tiltStrength={7}
            />
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "h-2 w-8 bg-accent"
                      : "h-2 w-2 bg-text-secondary/30 hover:bg-text-secondary/50"
                  }`}
                  aria-label={`${slide.model} ${slide.colorName} anzeigen`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
