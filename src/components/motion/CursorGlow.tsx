"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";

/**
 * Soft radial glow that follows the pointer inside its relatively-positioned
 * parent. Scoped to one container (e.g. the hero) rather than the whole page
 * so it reads as an intentional accent, not a gimmick. Desktop / fine-pointer only.
 */
export function CursorGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 120, damping: 30, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 120, damping: 30, mass: 0.6 });

  if (prefersReducedMotion) return null;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      <motion.div
        className="absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06]"
        style={{
          left: springX,
          top: springY,
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
