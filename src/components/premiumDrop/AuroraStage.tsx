"use client";

import { useReducedMotion, useScroll, useTransform, motion } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${4 + ((i * 61) % 92)}%`,
  size: 1 + (i % 3),
  duration: 10 + (i % 5) * 2.4,
  delay: (i % 7) * 0.8,
  opacity: 0.12 + (i % 3) * 0.06,
}));

interface AuroraStageProps {
  sectionRef: RefObject<HTMLElement | null>;
}

/**
 * Cinematic dark background for the Premium Drop stage: base gradient, a
 * slow-breathing aurora blob, a scroll-linked spotlight, faint grid, vignette,
 * dust-like particles and cursor parallax (desktop only, ref-driven so it
 * never triggers a React re-render).
 */
export function AuroraStage({ sectionRef }: AuroraStageProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const glowARef = useRef<HTMLDivElement>(null);
  const glowBRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const spotlightX = useTransform(scrollYProgress, [0, 0.5, 1], ["18%", "50%", "82%"]);
  const spotlightY = useTransform(scrollYProgress, [0, 0.5, 1], ["15%", "45%", "80%"]);

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
        if (glowARef.current) glowARef.current.style.transform = `translate3d(${px * -30}px, ${py * -20}px, 0)`;
        if (glowBRef.current) glowBRef.current.style.transform = `translate3d(${px * 26}px, ${py * 18}px, 0)`;
        if (auroraRef.current) auroraRef.current.style.transform = `translate3d(${px * -12}px, ${py * -8}px, 0)`;
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
      {/* Base */}
      <div className="absolute inset-0" style={{ background: "#07110d" }} />

      {/* Aurora blob */}
      <div
        ref={auroraRef}
        className="absolute left-1/2 top-[8%] h-[70%] w-[130%] -translate-x-1/2 opacity-[0.22] blur-[110px] transition-transform duration-300 ease-out"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 30%, #16c66a, #2dd4bf 25%, #22a3c4 45%, #2563eb 60%, transparent 75%)",
          animation: prefersReducedMotion ? undefined : "wtb-gradient-wander 16s ease-in-out infinite",
        }}
      />

      {/* Scroll-linked spotlight */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[100px]"
          style={{
            left: spotlightX,
            top: spotlightY,
            background: "radial-gradient(circle, #5eead4, transparent 70%)",
          }}
        />
      )}

      {/* Two parallax glows */}
      <div
        ref={glowARef}
        className="absolute -left-[8%] top-[10%] h-[380px] w-[380px] rounded-full opacity-[0.16] blur-[90px] transition-transform duration-300 ease-out"
        style={{ background: "radial-gradient(circle, #16c66a, transparent 70%)" }}
      />
      <div
        ref={glowBRef}
        className="absolute -right-[6%] bottom-[8%] h-[360px] w-[360px] rounded-full opacity-[0.14] blur-[95px] transition-transform duration-300 ease-out"
        style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent)",
        }}
      />

      {/* Dust particles */}
      {!prefersReducedMotion &&
        PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="absolute bottom-0 rounded-full bg-white"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              ["--wtb-particle-opacity" as string]: particle.opacity,
              animation: `wtb-particle-rise ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* Grain */}
      <div className="wtb-noise absolute inset-0 opacity-[0.03] mix-blend-overlay" />

      {/* Bottom fade into footer black */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(180deg, transparent, #111111)" }}
      />
    </div>
  );
}
