"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/Button";
import { ChevronRightIcon } from "@/components/Icons";
import { HeroDeviceModel } from "@/components/hero/HeroDeviceModel";
import { HERO_3D_DEVICES, HERO_PHONES, type HeroPhone } from "@/data/heroPhones";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeadline } from "@/components/motion/SplitHeadline";

interface Slot {
  phone: HeroPhone;
  /** Base horizontal offset from center, in % of stage width. */
  xPct: number;
  /** Base vertical offset from center, in % of stage height. */
  yPct: number;
  rotateZ: number;
  /** Literal Tailwind width classes per breakpoint — resolved in CSS, never in JS, so server and client always agree. */
  widthClass: string;
  zIndex: number;
  parallax: number;
  floatDuration: number;
  floatDelay: number;
  opacity: number;
  /** Horizontal back-and-forth drift amplitude (px) layered onto the float. */
  swayPx: number;
  /** Only render from this breakpoint up. */
  minBreakpoint?: "md" | "lg";
}

// Secondary background phones — smaller, more transparent, partially cropped
// at the edges so the two real-3D hero devices (iPhone 17 Pro, Galaxy A57)
// stay the clear visual focus.
const SLOTS: Slot[] = [
  {
    phone: HERO_PHONES[0], // Galaxy S26 Ultra — Silver, right-back
    xPct: 34,
    yPct: 15,
    rotateZ: 3,
    widthClass: "w-[118px] md:w-[150px] lg:w-[172px]",
    zIndex: 22,
    parallax: 0.45,
    floatDuration: 6.8,
    floatDelay: 0.9,
    opacity: 0.8,
    swayPx: 10,
    minBreakpoint: undefined,
  },
  {
    phone: HERO_PHONES[1], // Pixel 10a — Berry, far left peek
    xPct: -52,
    yPct: 10,
    rotateZ: -4,
    widthClass: "w-[140px]",
    zIndex: 8,
    parallax: 0.28,
    floatDuration: 7.5,
    floatDelay: 0.6,
    opacity: 0.55,
    swayPx: 12,
    minBreakpoint: "md",
  },
  {
    phone: HERO_PHONES[2], // iPhone 16 — Teal, far right peek
    xPct: 56,
    yPct: 8,
    rotateZ: 4,
    widthClass: "w-[132px]",
    zIndex: 8,
    parallax: 0.25,
    floatDuration: 8,
    floatDelay: 1.2,
    opacity: 0.5,
    swayPx: 12,
    minBreakpoint: "lg",
  },
];

function BackgroundPhone({
  phone,
  priority,
}: {
  phone: HeroPhone;
  priority: boolean;
}) {
  return (
    <Image
      src={phone.front}
      alt={`${phone.model} ${phone.colorName}`}
      fill
      sizes="(max-width: 768px) 40vw, 16vw"
      priority={priority}
      className="object-contain p-[6%]"
    />
  );
}

function PhoneSlot({
  slot,
  index,
  pointerX,
  pointerY,
  scrollSpread,
  reducedMotion,
}: {
  slot: Slot;
  index: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollSpread: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const parallaxX = useTransform(pointerX, (v) => v * 18 * slot.parallax);
  const parallaxY = useTransform(pointerY, (v) => v * 12 * slot.parallax);
  const springX = useSpring(parallaxX, { stiffness: 90, damping: 18, mass: 0.4 });
  const springY = useSpring(parallaxY, { stiffness: 90, damping: 18, mass: 0.4 });
  const spreadX = useTransform(
    scrollSpread,
    [0, 1],
    [0, slot.xPct === 0 ? 0 : Math.sign(slot.xPct) * 14],
  );

  const visibilityClass =
    slot.minBreakpoint === "lg"
      ? "hidden lg:block"
      : slot.minBreakpoint === "md"
        ? "hidden md:block"
        : "block";

  return (
    // `left`/`top` percentages resolve against this stage (the containing
    // block) — unlike `transform: translateX(%)`, which resolves against the
    // element's OWN size and would silently ignore how wide the stage is.
    <motion.div
      className={`absolute ${visibilityClass}`}
      style={{
        left: `calc(50% + ${slot.xPct}%)`,
        top: `calc(50% + ${slot.yPct}%)`,
        zIndex: slot.zIndex,
        opacity: slot.opacity,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: slot.opacity, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        style={{
          translateX: "-50%",
          translateY: "-50%",
          x: reducedMotion ? 0 : springX,
          y: reducedMotion ? 0 : springY,
        }}
      >
      <motion.div style={{ x: reducedMotion ? 0 : spreadX }}>
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -8, 0, 7, 0],
                x: [0, slot.swayPx, 0, -slot.swayPx, 0],
                rotateZ: [slot.rotateZ - 1.4, slot.rotateZ + 1.2, slot.rotateZ - 1.4],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: slot.floatDuration,
                delay: slot.floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <Link
          href={`/products/${slot.phone.slug}`}
          aria-label={`${slot.phone.model} ${slot.phone.colorName} entdecken`}
          className={`relative block aspect-[9/18.5] transition-transform duration-500 ease-out hover:scale-[1.03] ${slot.widthClass}`}
        >
          <div
            className="absolute bottom-[2%] left-1/2 h-[9%] w-[68%] -translate-x-1/2 rounded-full bg-black/14 blur-md"
            aria-hidden="true"
          />
          <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-white/85 ring-1 ring-black/[0.05] shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
            <BackgroundPhone phone={slot.phone} priority={false} />
          </div>
        </Link>
      </motion.div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function PhoneShowcaseHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const scrollSpread = useTransform(scrollYProgress, [0, 1], [0, 1]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(relX * 2);
    pointerY.set(relY * 2);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfbfd_0%,#f5f5f7_100%)] pt-14"
    >
      {/* Ambient glow — subtly tinted toward the two hero devices' colours */}
      <div
        className="pointer-events-none absolute left-1/2 top-[6%] h-[62vw] max-h-[580px] w-[62vw] max-w-[580px] -translate-x-1/2 rounded-full opacity-[0.15] blur-[95px]"
        style={{ background: HERO_3D_DEVICES.iphone17Pro.colorHex }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[14%] top-[42%] h-[28vw] max-h-[280px] w-[28vw] max-w-[280px] rounded-full opacity-[0.14] blur-[85px]"
        style={{ background: HERO_3D_DEVICES.galaxyA57.colorHex }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-4 px-5 py-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-8 md:px-8 md:py-16 lg:px-10">
        <div className="order-1 flex flex-col items-start text-left">
          <Reveal variant="fade" duration={0.5} mode="mount">
            <span className="badge-techbuy mb-3">Neu eingetroffen</span>
          </Reveal>

          <SplitHeadline
            as="h1"
            text="Dein nächstes Smartphone wartet."
            delay={0.1}
            wordDelay={0.06}
            mode="mount"
            className="mb-4 text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-text-primary md:text-[44px] lg:text-[52px]"
          />

          <Reveal variant="up-soft" duration={0.6} delay={0.32} mode="mount">
            <p className="mb-6 max-w-[420px] text-[15px] leading-relaxed text-text-secondary md:text-[17px]">
              Entdecke aktuelle iPhones, Galaxy- und Pixel-Modelle — zu Bestpreisen bei TechBuy.
            </p>
          </Reveal>

          <Reveal variant="up-soft" duration={0.6} delay={0.44} mode="mount">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="hero-primary" href="/smartphones" className="group">
                Smartphones entdecken
                <ChevronRightIcon className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-secondary" href="/compare">
                Modelle vergleichen
              </Button>
            </div>
          </Reveal>
        </div>

        <div
          className="order-2 h-[320px] touch-none select-none sm:h-[380px] md:h-[440px] lg:h-[500px]"
          style={{ perspective: 1400 }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className="relative h-full w-full">
            {SLOTS.map((slot, index) => (
              <PhoneSlot
                key={slot.phone.id}
                slot={slot}
                index={index}
                pointerX={pointerX}
                pointerY={pointerY}
                scrollSpread={scrollSpread}
                reducedMotion={prefersReducedMotion}
              />
            ))}

            {/* Galaxy A57 — real 3D GLB, left-back, secondary hero device */}
            <div
              className="absolute"
              style={{ left: "22%", top: "58%", zIndex: 30 }}
            >
              <div style={{ transform: "translate(-50%, -50%)" }}>
                <HeroDeviceModel
                  slug={HERO_3D_DEVICES.galaxyA57.slug}
                  ariaLabel={`${HERO_3D_DEVICES.galaxyA57.model} entdecken`}
                  modelPath={HERO_3D_DEVICES.galaxyA57.modelPath}
                  colorHex={HERO_3D_DEVICES.galaxyA57.colorHex}
                  fallbackImage={HERO_3D_DEVICES.galaxyA57.fallbackImage}
                  fallbackImageAlt={`${HERO_3D_DEVICES.galaxyA57.model} ${HERO_3D_DEVICES.galaxyA57.colorName}`}
                  viewCycleSeconds={6}
                  glowColor={HERO_3D_DEVICES.galaxyA57.colorHex}
                  floatDuration={12}
                  floatDelay={0.4}
                  sizeClassName="w-[128px] sm:w-[160px] md:w-[200px] lg:w-[230px]"
                  zIndex={30}
                  reducedMotion={prefersReducedMotion}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  tiltStrength={6}
                />
              </div>
            </div>

            {/* iPhone 17 Pro — real 3D GLB, large and centred, the hero's focal device */}
            <div
              className="absolute"
              style={{ left: "52%", top: "48%", zIndex: 50 }}
            >
              <div style={{ transform: "translate(-50%, -50%)" }}>
                <HeroDeviceModel
                  slug={HERO_3D_DEVICES.iphone17Pro.slug}
                  ariaLabel={`${HERO_3D_DEVICES.iphone17Pro.model} entdecken`}
                  modelPath={HERO_3D_DEVICES.iphone17Pro.modelPath}
                  colorModelPath={HERO_3D_DEVICES.iphone17Pro.modelPath}
                  colorHex={HERO_3D_DEVICES.iphone17Pro.colorHex}
                  fallbackImage={HERO_3D_DEVICES.iphone17Pro.fallbackImage}
                  fallbackImageAlt={`${HERO_3D_DEVICES.iphone17Pro.model} ${HERO_3D_DEVICES.iphone17Pro.colorName}`}
                  glowColor={HERO_3D_DEVICES.iphone17Pro.colorHex}
                  floatDuration={10}
                  floatDelay={0}
                  sizeClassName="w-[190px] sm:w-[230px] md:w-[290px] lg:w-[340px]"
                  zIndex={50}
                  reducedMotion={prefersReducedMotion}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  tiltStrength={8}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
