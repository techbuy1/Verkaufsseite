"use client";

import { motion, useReducedMotion } from "motion/react";

interface FloatingSpecPillsProps {
  specs: string[];
  positions: Array<{ top: string; left?: string; right?: string }>;
}

export function FloatingSpecPills({ specs, positions }: FloatingSpecPillsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {specs.map((spec, index) => {
        const position = positions[index];
        if (!position) return null;
        return (
          <motion.div
            key={spec}
            className="absolute z-20 hidden rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-white/80 backdrop-blur-md md:block"
            style={{
              top: position.top,
              left: position.left,
              right: position.right,
              animation: prefersReducedMotion
                ? undefined
                : `wtb-float-soft ${5 + index}s ease-in-out ${index * 0.4}s infinite`,
            }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14, scale: 0.9 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 + index * 0.15 }}
          >
            {spec}
          </motion.div>
        );
      })}
    </>
  );
}
