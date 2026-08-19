"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { HighlightHotspot } from "@/data/featuredHighlights";

interface DeviceHotspotProps {
  hotspot: HighlightHotspot;
  delay?: number;
  accentColor: string;
}

export function DeviceHotspot({ hotspot, delay = 0, accentColor }: DeviceHotspotProps) {
  const [open, setOpen] = useState(false);
  const cardOnRight = hotspot.x < 55;

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        className="group relative -ml-[9px] -mt-[9px] flex h-[18px] w-[18px] items-center justify-center"
        aria-expanded={open}
        aria-label={hotspot.title}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-white"
          style={{ backgroundColor: accentColor }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-6 z-30 w-[200px] rounded-2xl border border-black/[0.06] bg-white/95 p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-md ${
              cardOnRight ? "left-0" : "right-0"
            }`}
          >
            <p className="text-[13px] font-semibold text-text-primary">{hotspot.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              {hotspot.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
