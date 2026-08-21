"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export interface CollageShot {
  src: string;
  alt: string;
}

interface DeviceImageCollageProps {
  /** Front-facing hero shot — rendered largest, centered, on top. */
  front: CollageShot;
  /** Secondary angles (e.g. back, side) — fanned out behind the front shot. */
  angles: CollageShot[];
  href?: string;
  ariaLabel?: string;
  className?: string;
}

const ANGLE_LAYOUT = [
  { top: "3%", left: "8%", rotate: -9, width: "46%", z: 0 },
  { top: "14%", left: "64%", rotate: 10, width: "24%", z: 5 },
] as const;

/**
 * Static-image stand-in for the interactive 3D hero — same front/back/side
 * angles a customer would get by dragging the model, but as plain <Image>s.
 * Zero WebGL/three.js on the page: no Canvas, no GLB fetch, no per-frame
 * render loop competing with everything else mounted on the homepage.
 */
export function DeviceImageCollage({
  front,
  angles,
  href,
  ariaLabel,
  className = "",
}: DeviceImageCollageProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const content = (
    <div className={`relative aspect-[4/5] w-full ${className}`}>
      {angles.slice(0, 2).map((shot, index) => {
        const layout = ANGLE_LAYOUT[index];
        if (!layout) return null;
        return (
          <motion.div
            key={shot.src}
            className="absolute drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            style={{ top: layout.top, left: layout.left, width: layout.width, zIndex: layout.z }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, rotate: 0 }}
            animate={{ opacity: 0.92, scale: 1, rotate: layout.rotate }}
            transition={{ duration: 0.7, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              width={600}
              height={750}
              className="h-auto w-full object-contain"
              sizes="(max-width: 768px) 40vw, 220px"
            />
          </motion.div>
        );
      })}

      <motion.div
        className="float-idle absolute left-1/2 top-1/2 z-10 w-[58%] -translate-x-1/2 -translate-y-[46%] drop-shadow-[0_28px_54px_rgba(0,0,0,0.4)]"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={front.src}
          alt={front.alt}
          width={700}
          height={875}
          priority
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 60vw, 340px"
        />
      </motion.div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={ariaLabel} className="block h-full w-full">
      {content}
    </Link>
  );
}
