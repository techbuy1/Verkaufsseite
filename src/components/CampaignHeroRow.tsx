"use client";

import type { HeroProduct as HeroProductType } from "@/types/hero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "./Button";
import { HeroSeamlessImage } from "./HeroSeamlessImage";
import { ChevronRightIcon } from "./Icons";
import { CursorGlow } from "./motion/CursorGlow";
import { Magnetic } from "./motion/Magnetic";
import { Reveal } from "./motion/Reveal";
import { SplitHeadline } from "./motion/SplitHeadline";
import { TiltCard } from "./motion/TiltCard";

interface CampaignHeroRowProps {
  product: HeroProductType;
  onBuy?: () => void;
  imagePosition: "left" | "right";
  priority?: boolean;
  /** Full staged word-by-word reveal (page load). Set false for routine autoplay slide swaps to avoid repeated long empty-look transitions. */
  richIntro?: boolean;
  /** Fade the whole row in once it scrolls into view. Disable for a carousel slide — it's already on screen at mount, so waiting on an IntersectionObserver per remount only delays it. */
  scrollReveal?: boolean;
}

export function CampaignHeroRow({
  product,
  onBuy,
  imagePosition,
  priority = false,
  richIntro = true,
  scrollReveal = true,
}: CampaignHeroRowProps) {
  const { ref, isVisible: observedVisible } = useScrollAnimation<HTMLDivElement>();
  const isVisible = scrollReveal ? observedVisible : true;
  const isLight = product.themeMode !== "dark";
  const surface = product.themeBackground ?? "var(--color-surface-hero)";

  const textOrder = "order-1";
  const imageOrder = "order-2";
  const desktopTextOrder = imagePosition === "right" ? "md:order-1" : "md:order-2";
  const desktopImageOrder = imagePosition === "right" ? "md:order-2" : "md:order-1";

  const imageWidth = product.imageWidth ?? 1200;
  const imageHeight = product.imageHeight ?? 900;

  // Full staged choreography only plays once, on page load. Routine autoplay
  // slide swaps use a quick uniform crossfade so the hero isn't half-empty
  // for over a second on every rotation.
  const quickDuration = 0.4;
  const delays = richIntro
    ? { name: 0.05, headline: 0.12, sub: 0.32, cta: 0.42, image: 0.2 }
    : { name: 0, headline: 0, sub: 0.05, cta: 0.1, image: 0 };

  return (
    <div
      ref={ref}
      className={`relative flex min-h-[380px] items-center overflow-hidden sm:min-h-[440px] md:min-h-[520px] lg:min-h-[580px] xl:max-h-[650px] transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[12px] opacity-0"
      }`}
      style={{ background: surface }}
    >
      {/* Background layer — appears first, subtle depth without neon blobs */}
      <div
        className="parallax-orb parallax-orb-a -left-[10%] top-[-15%] h-[46vw] max-h-[420px] w-[46vw] max-w-[420px] opacity-[0.10]"
        style={{ background: isLight ? "var(--color-accent)" : "#2c2c2e" }}
        aria-hidden="true"
      />
      <div
        className="parallax-orb parallax-orb-b bottom-[-20%] right-[-8%] h-[38vw] max-h-[360px] w-[38vw] max-w-[360px] opacity-[0.08]"
        style={{ background: isLight ? "var(--color-techbuy-black)" : "var(--color-accent)" }}
        aria-hidden="true"
      />
      <CursorGlow />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          <div
            className={`${textOrder} ${desktopTextOrder} flex min-w-0 flex-col items-start justify-center text-left`}
          >
            {product.eyebrow && (
              <Reveal variant="fade" duration={0.5} mode="mount">
                <span className="badge-techbuy mb-3">{product.eyebrow}</span>
              </Reveal>
            )}

            <Reveal
              variant="blur"
              duration={richIntro ? 0.6 : quickDuration}
              delay={delays.name}
              mode="mount"
            >
              <p
                className={`mb-2 text-[20px] font-semibold tracking-tight md:text-[26px] ${
                  isLight ? "text-text-primary" : "text-white"
                }`}
              >
                {product.name}
              </p>
            </Reveal>

            {richIntro ? (
              <SplitHeadline
                as="h2"
                text={product.tagline}
                delay={delays.headline}
                wordDelay={0.06}
                mode="mount"
                className={`mb-4 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-balance md:text-[44px] lg:text-[52px] ${
                  isLight ? "text-text-primary" : "text-white"
                }`}
              />
            ) : (
              <Reveal variant="fade" duration={quickDuration} mode="mount">
                <h2
                  className={`mb-4 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-balance md:text-[44px] lg:text-[52px] ${
                    isLight ? "text-text-primary" : "text-white"
                  }`}
                >
                  {product.tagline}
                </h2>
              </Reveal>
            )}

            <Reveal
              variant="up-soft"
              duration={richIntro ? 0.6 : quickDuration}
              delay={delays.sub}
              mode="mount"
            >
              <p
                className={`mb-6 max-w-[480px] text-[15px] leading-relaxed md:text-[17px] lg:text-[18px] ${
                  isLight ? "text-text-secondary" : "text-[#a1a1a6]"
                }`}
              >
                {product.subheadline}
              </p>
            </Reveal>

            <Reveal
              variant="up-soft"
              duration={richIntro ? 0.6 : quickDuration}
              delay={delays.cta}
              mode="mount"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="hero-secondary" href={`/products/${product.slug}`}>
                  Entdecken
                </Button>
                <Magnetic strength={0.3}>
                  <Button variant="hero-primary" onClick={onBuy} className="group">
                    Kaufen
                    <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>

          <div className={`${imageOrder} ${desktopImageOrder} w-full min-w-0 float-idle`}>
            <TiltCard maxTilt={6}>
              <Reveal
                variant="scale"
                duration={richIntro ? 0.8 : quickDuration}
                delay={delays.image}
                mode="mount"
              >
                <HeroSeamlessImage
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  width={imageWidth}
                  height={imageHeight}
                  priority={priority}
                />
              </Reveal>
            </TiltCard>
          </div>
        </div>
      </div>
    </div>
  );
}
