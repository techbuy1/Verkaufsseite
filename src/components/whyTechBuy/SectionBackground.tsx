"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const PARTICLES = [
  { left: "8%", size: 3, duration: 9, delay: 0 },
  { left: "22%", size: 2, duration: 11, delay: 1.5 },
  { left: "41%", size: 3, duration: 8.5, delay: 3 },
  { left: "63%", size: 2, duration: 12, delay: 0.8 },
  { left: "78%", size: 3, duration: 10, delay: 2.2 },
  { left: "91%", size: 2, duration: 9.5, delay: 4 },
];

/**
 * Decorative background: two slow glow orbs with cursor-parallax (desktop
 * only, driven via a ref + direct style writes — no React state per frame),
 * a handful of rising light particles, a faint grid, and a noise layer.
 */
export function SectionBackground() {
  const prefersReducedMotion = useReducedMotion();
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    function handleMove(event: MouseEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = container!.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        if (orbARef.current) {
          orbARef.current.style.transform = `translate3d(${px * -24}px, ${py * -18}px, 0)`;
        }
        if (orbBRef.current) {
          orbBRef.current.style.transform = `translate3d(${px * 18}px, ${py * 14}px, 0)`;
        }
      });
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base dark gradient with subtle green/petrol depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, #10231c 0%, transparent 55%), radial-gradient(100% 80% at 100% 100%, #0d1f22 0%, transparent 50%), #06110f",
        }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(80% 60% at 50% 30%, black, transparent)",
        }}
      />

      {/* Glow orbs */}
      <div
        ref={orbARef}
        className="absolute -left-[10%] top-[-10%] h-[440px] w-[440px] rounded-full opacity-[0.16] blur-[90px] transition-transform duration-300 ease-out"
        style={{ background: "radial-gradient(circle, #16c66a, transparent 70%)" }}
      />
      <div
        ref={orbBRef}
        className="absolute bottom-[-15%] right-[-8%] h-[420px] w-[420px] rounded-full opacity-[0.13] blur-[100px] transition-transform duration-300 ease-out"
        style={{ background: "radial-gradient(circle, #22a3c4, transparent 70%)" }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[80px]"
        style={{ background: "radial-gradient(circle, #7c5cff, transparent 70%)" }}
      />

      {/* Rising particles */}
      {!prefersReducedMotion &&
        PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="absolute bottom-0 rounded-full bg-accent"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              ["--wtb-particle-opacity" as string]: 0.5,
              boxShadow: "0 0 6px 1px rgba(22,198,106,0.5)",
              animation: `wtb-particle-rise ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}

      {/* Grain */}
      <div className="wtb-noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}
