"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Thin curved light line connecting the two product stages, drawn in on
 * scroll with an occasional travelling pulse along the same path.
 */
export function LightTrail() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pd-trail-grad" x1="20" y1="25" x2="80" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16c66a" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <motion.path
        id="pd-trail-path"
        d="M27 30 C 45 30, 40 70, 73 70"
        fill="none"
        stroke="url(#pd-trail-grad)"
        strokeWidth="0.15"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        initial={prefersReducedMotion ? undefined : { pathLength: 0, opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {!prefersReducedMotion && (
        <circle r="0.6" fill="#5eead4">
          <animateMotion dur="5.5s" repeatCount="indefinite" begin="1.2s" rotate="auto">
            <mpath href="#pd-trail-path" />
          </animateMotion>
          <animate attributeName="opacity" values="0;0.9;0" dur="5.5s" repeatCount="indefinite" begin="1.2s" />
        </circle>
      )}
    </svg>
  );
}
