"use client";

import { useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { useGLTF } from "@react-three/drei";
import { Button } from "@/components/Button";
import { ChevronRightIcon } from "@/components/Icons";
import { HeroDeviceModel } from "@/components/hero/HeroDeviceModel";
import { ANKAUF_URL, SELL_HERO } from "@/data/sellHeroSlides";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeadline } from "@/components/motion/SplitHeadline";

/**
 * Trade-in hero — dark, Apple-keynote-style banner with a single static
 * Cosmic Orange iPhone 17 Pro (no carousel).
 */
export function SellHeroCarousel() {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const { device, eyebrow, headline, subheadline, ctaLabel } = SELL_HERO;

  useEffect(() => {
    useGLTF.preload(device.colorModelPath ?? device.modelPath);
  }, [device.colorModelPath, device.modelPath]);

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

  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#242430_0%,#0c0c0f_55%,#000000_100%)] pt-14"
      aria-label="Smartphone verkaufen"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[6%] h-[58vw] max-h-[560px] w-[58vw] max-w-[560px] -translate-x-1/2 rounded-full opacity-[0.22] blur-[110px]"
        style={{ background: device.glowColor }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 py-16 md:grid-cols-[42%_1fr] md:gap-6 md:px-8 md:py-20 lg:gap-10 lg:px-10">
        <div className="order-1 flex flex-col items-start text-left">
          <Reveal variant="fade" duration={0.5}>
            <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur-sm">
              {eyebrow}
            </span>
          </Reveal>

          <SplitHeadline
            as="h1"
            text={headline}
            wordDelay={0.05}
            className="mb-4 text-[32px] font-bold leading-[1.08] tracking-[-0.03em] text-balance text-white md:text-[42px] lg:text-[48px]"
          />

          <Reveal variant="up-soft" duration={0.6} delay={0.2}>
            <p className="mb-7 max-w-[420px] text-[15px] leading-relaxed text-white/60 md:text-[17px]">
              {subheadline}
            </p>
          </Reveal>

          <Reveal variant="up-soft" duration={0.6} delay={0.34}>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="hero-primary"
                href={ANKAUF_URL}
                target="_blank"
                className="group"
              >
                {ctaLabel}
                <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-secondary-dark" href="/smartphones">
                Neues Gerät entdecken
              </Button>
            </div>
          </Reveal>
        </div>

        <div
          className="order-2 relative h-[400px] select-none touch-pan-y sm:h-[460px] md:h-[560px] lg:h-[620px] xl:h-[680px]"
          style={{ perspective: 1400, touchAction: "pan-y" }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className="absolute" style={{ left: "50%", top: "50%" }}>
            <HeroDeviceModel
              slug=""
              href={ANKAUF_URL}
              ariaLabel={`${device.alt} bei TechBuy Ankauf verkaufen`}
              modelPath={device.modelPath}
              colorModelPath={device.colorModelPath}
              colorHex={device.colorHex}
              fallbackImage={device.fallbackImage}
              fallbackImageAlt={device.alt}
              glowColor={device.glowColor}
              floatDuration={9}
              floatDelay={0}
              sizeClassName="w-[210px] sm:w-[250px] md:w-[300px] lg:w-[340px] xl:w-[380px]"
              zIndex={10}
              reducedMotion={prefersReducedMotion}
              pointerX={pointerX}
              pointerY={pointerY}
              tiltStrength={7}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
