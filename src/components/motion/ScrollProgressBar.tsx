"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Thin accent progress line under the header, tracking scroll position. */
export function ScrollProgressBar() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
