"use client";

import { Button } from "@/components/Button";
import { ChevronRightIcon } from "@/components/Icons";
import { DeviceImageCollage } from "@/components/hero/DeviceImageCollage";
import { SELL_HERO } from "@/data/sellHeroSlides";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { WordCarousel } from "@/components/motion/WordCarousel";

/**
 * Shop hero — Cosmic Orange iPhone 17 Pro with buy-focused copy (no Ankauf).
 * Uses a static front/back/side image collage instead of the interactive 3D
 * viewer: the homepage doesn't need to load three.js/@react-three just to
 * show its very first section.
 */
export function SellHeroCarousel() {
  const {
    device,
    eyebrow,
    headlinePrefix,
    carouselWords,
    subheadline,
    ctaLabel,
    secondaryCtaLabel,
    ctaHref,
    secondaryCtaHref,
  } = SELL_HERO;

  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#242430_0%,#0c0c0f_55%,#000000_100%)] pt-14"
      aria-label="iPhone 17 Pro kaufen"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[6%] h-[58vw] max-h-[560px] w-[58vw] max-w-[560px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[70px]"
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

          <h1 className="mb-4 text-[32px] font-bold leading-[1.08] tracking-[-0.03em] text-balance text-white md:text-[42px] lg:text-[48px]">
            <SplitHeadline
              as="span"
              text={headlinePrefix}
              wordDelay={0.05}
              mode="mount"
              className="mr-2"
            />{" "}
            <WordCarousel words={carouselWords} style={{ color: device.glowColor }} />
          </h1>

          <Reveal variant="up-soft" duration={0.6} delay={0.2}>
            <p className="mb-7 max-w-[420px] text-[15px] leading-relaxed text-white/60 md:text-[17px]">
              {subheadline}
            </p>
          </Reveal>

          <Reveal variant="up-soft" duration={0.6} delay={0.34}>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="hero-primary" href={ctaHref} className="group">
                {ctaLabel}
                <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-secondary-dark" href={secondaryCtaHref}>
                {secondaryCtaLabel}
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="order-2 mx-auto w-full max-w-[420px] select-none md:max-w-none">
          <DeviceImageCollage
            front={{ src: device.collage.front, alt: device.alt }}
            angles={device.collage.angles.map((src) => ({ src, alt: `${device.alt} – weitere Ansicht` }))}
            href={ctaHref}
            ariaLabel={`${device.alt} jetzt bei TechBuy kaufen`}
          />
        </div>
      </div>
    </section>
  );
}
