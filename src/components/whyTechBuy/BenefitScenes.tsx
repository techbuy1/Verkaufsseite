"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Benefit } from "@/data/benefits";

const VIEWPORT = { once: true, amount: 0.6 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

interface SceneProps {
  /** Changing this remounts the scene's root, replaying its whileInView entrance. */
  replay: number;
}

/** 01 — Schneller Versand: package flies in, floats, speed-lines behind it. */
function ShippingScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-[2px] rounded-full bg-gradient-to-r from-transparent to-accent/70"
            style={{ width: 18 - i * 4, marginLeft: i * 3 }}
          />
        ))}
      </div>
      <motion.div
        className="wtb-float-soft relative"
        style={{ ["--wtb-rot-from" as string]: "-3deg", ["--wtb-rot-to" as string]: "2deg" }}
        initial={reduced ? undefined : { opacity: 0, x: 16, rotate: -8 }}
        whileInView={reduced ? undefined : { opacity: 1, x: 0, rotate: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="drop-shadow-[0_8px_16px_rgba(22,198,106,0.25)] transition-transform duration-300 group-hover:-translate-x-1">
          <path d="M26 6 46 16v20L26 46 6 36V16Z" stroke="url(#ship-grad)" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(22,198,106,0.08)" />
          <path d="M6 16 26 26l20-10M26 26v20" stroke="url(#ship-grad)" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
          <defs>
            <linearGradient id="ship-grad" x1="6" y1="6" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#16c66a" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

/** 02 — 30 Tage Rückgabe: calendar with "30", flap opens, ring sweeps around. */
function ReturnScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="absolute">
        <motion.circle
          cx="30"
          cy="30"
          r="26"
          stroke="url(#ret-grad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="163"
          initial={reduced ? undefined : { strokeDashoffset: 163, opacity: 0 }}
          whileInView={reduced ? undefined : { strokeDashoffset: 0, opacity: 0.8 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
        />
        <defs>
          <linearGradient id="ret-grad" x1="4" y1="4" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16c66a" />
            <stop offset="1" stopColor="#5eead4" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="relative flex h-11 w-11 flex-col items-center justify-center overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.04]"
        style={{ transformOrigin: "top center" }}
        initial={reduced ? undefined : { rotateX: -55, opacity: 0 }}
        whileInView={reduced ? undefined : { rotateX: 0, opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span className="h-2 w-full bg-gradient-to-r from-accent to-[#5eead4]" />
        <span className="mt-1.5 text-[15px] font-bold leading-none text-white">30</span>
        <span className="mt-0.5 text-[7px] font-medium uppercase tracking-wide text-white/50">Tage</span>
      </motion.div>

      <svg width="14" height="14" viewBox="0 0 24 24" className="absolute -bottom-1 -right-1 -translate-x-1 text-accent opacity-0 transition-all duration-300 group-hover:-translate-x-2.5 group-hover:opacity-100">
        <path d="M20 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

/** 03 — Sichere Zahlung: shield scales in from blur, checkmark draws, light orbits. */
function PaymentScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      {!reduced && (
        <div className="wtb-orbit absolute h-16 w-16 [animation-duration:7s]">
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(22,198,106,0.6)]" />
        </div>
      )}
      <motion.svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        initial={reduced ? undefined : { opacity: 0, scale: 0.7, filter: "blur(6px)" }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={VIEWPORT}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <path
          d="M23 3 40 9v12c0 11-7.5 17.5-17 22C13.5 38.5 6 32 6 21V9Z"
          fill="rgba(22,198,106,0.08)"
          stroke="url(#pay-grad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <motion.path
          d="M15 23l6 6 11-13"
          stroke="url(#pay-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="26"
          initial={reduced ? undefined : { strokeDashoffset: 26 }}
          whileInView={reduced ? undefined : { strokeDashoffset: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
        />
        <defs>
          <linearGradient id="pay-grad" x1="6" y1="3" x2="40" y2="43" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5eead4" />
            <stop offset="1" stopColor="#16c66a" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}

/** 04 — Geprüfte Qualität: badge scales + rotates in, checkmark draws, shine sweeps. */
function QualityScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      <motion.div
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent"
        initial={reduced ? undefined : { scale: 0.6, rotate: -18, opacity: 0 }}
        whileInView={reduced ? undefined : { scale: 1, rotate: 0, opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 12.5 10 17 19 6.5"
            stroke="url(#qual-grad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="20"
            initial={reduced ? undefined : { strokeDashoffset: 20 }}
            whileInView={reduced ? undefined : { strokeDashoffset: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.45, ease: EASE, delay: 0.4 }}
          />
          <defs>
            <linearGradient id="qual-grad" x1="5" y1="6" x2="19" y2="17" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#16c66a" />
            </linearGradient>
          </defs>
        </svg>
        {!reduced && (
          <span className="wtb-shine pointer-events-none absolute inset-0 [animation:wtb-shine-sweep_3.2s_ease-in-out_infinite] [animation-delay:1s] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        )}
      </motion.div>
      <span className="absolute inset-0 rounded-full border border-dashed border-white/[0.08]" />
    </div>
  );
}

/** 05 — Faire Preise: price tag floats in, tiny particles drift behind it. */
function PriceScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      {!reduced &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="wtb-particle absolute h-[3px] w-[3px] rounded-full bg-accent"
            style={{
              left: `${30 + i * 14}%`,
              bottom: "20%",
              ["--wtb-particle-opacity" as string]: 0.5,
              animation: `wtb-particle-rise ${3.4 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      <motion.div
        className="relative transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-[1.04]"
        initial={reduced ? undefined : { opacity: 0, y: 14 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path
            d="M25 5h13a3 3 0 0 1 3 3v13a3 3 0 0 1-.9 2.1L22.6 40.6a3 3 0 0 1-4.2 0L5.9 28.1a3 3 0 0 1 0-4.2L22.4 6.9A3 3 0 0 1 25 5Z"
            fill="rgba(22,198,106,0.08)"
            stroke="url(#price-grad)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="31" cy="12" r="3" fill="url(#price-grad)" />
          <path d="M15 30 30 15" stroke="url(#price-grad)" strokeWidth="1.8" strokeLinecap="round" />
          <defs>
            <linearGradient id="price-grad" x1="6" y1="5" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#16c66a" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

/** 06 — Persönlicher Support: chat bubbles pop in, typing dots, then a reply check. */
function SupportScene({ replay }: SceneProps) {
  const reduced = useReducedMotion();
  return (
    <div key={replay} className="relative flex h-20 w-20 items-center justify-center">
      <div className="flex flex-col items-start gap-1.5">
        <motion.div
          className="rounded-2xl rounded-bl-sm bg-white/[0.08] px-2.5 py-1.5 text-[9px] text-white/70"
          initial={reduced ? undefined : { opacity: 0, y: 8, scale: 0.9 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.4, ease: EASE }}
        >
          Hallo 👋
        </motion.div>
        <motion.div
          className="ml-3 flex items-center gap-1 rounded-2xl rounded-bl-sm bg-accent/15 px-2.5 py-1.5"
          initial={reduced ? undefined : { opacity: 0, y: 8, scale: 0.9 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-accent"
              style={{ animation: reduced ? undefined : `wtb-blink-dot 1.4s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </motion.div>
        <motion.div
          className="ml-3 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"
          initial={reduced ? undefined : { opacity: 0, scale: 0 }}
          whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.35, ease: EASE, delay: 0.9 }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5 10 17 19 6.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

export const BENEFIT_SCENES: Record<Benefit["icon"], (props: SceneProps) => React.ReactElement> = {
  shipping: ShippingScene,
  return: ReturnScene,
  payment: PaymentScene,
  quality: QualityScene,
  price: PriceScene,
  support: SupportScene,
};
