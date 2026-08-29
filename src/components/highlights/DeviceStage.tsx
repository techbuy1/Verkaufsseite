"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HighlightHotspot } from "@/data/featuredHighlights";
import { DeviceHotspot } from "./DeviceHotspot";

interface DeviceStageProps {
  image: string;
  alt: string;
  hotspots: HighlightHotspot[];
  accentColor: string;
  showHotspots: boolean;
}

const MAX_TILT = 10;

export function DeviceStage({ image, alt, hotspots, accentColor, showHotspots }: DeviceStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [displayImage, setDisplayImage] = useState(image);
  const [imageVisible, setImageVisible] = useState(true);

  useEffect(() => {
    if (image === displayImage) return;
    setImageVisible(false);
    const timer = window.setTimeout(() => {
      setDisplayImage(image);
      setImageVisible(true);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [image, displayImage]);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 24, mass: 0.6 };
  const spx = useSpring(px, springConfig);
  const spy = useSpring(py, springConfig);

  const rotateX = useTransform(spy, [0, 1], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(spx, [0, 1], [-MAX_TILT, MAX_TILT]);
  const sheenX = useTransform(spx, [0, 1], ["10%", "90%"]);
  const sheenY = useTransform(spy, [0, 1], ["10%", "90%"]);
  const sheenBackground = useMotionTemplate`radial-gradient(220px circle at ${sheenX} ${sheenY}, white, transparent 70%)`;
  const shadowX = useTransform(spx, [0, 1], [10, -10]);
  const shadowScale = useTransform(
    [spx, spy],
    ([x, y]: number[]) => 1 - Math.min(0.14, (Math.abs(x - 0.5) + Math.abs(y - 0.5)) * 0.22),
  );

  function updateFromPoint(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)));
    py.set(Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)));
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    updateFromPoint(event.clientX, event.clientY);
  };


  return (
    <div className="relative flex items-center justify-center">
      {/* Shadow */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-[6%] h-[10%] w-[62%] rounded-full bg-black/20 blur-2xl"
        style={
          prefersReducedMotion
            ? undefined
            : { x: shadowX, scale: shadowScale }
        }
      />

      <div className="float-idle relative w-full max-w-[340px]">
        <motion.div
          ref={containerRef}
          className="relative aspect-[3/4] w-full touch-pan-y"
          style={{
            rotateX: prefersReducedMotion ? 0 : rotateX,
            rotateY: prefersReducedMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
            transformPerspective: 1200,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={reset}
          onTouchEnd={reset}
        >
          <Image
            key={displayImage}
            src={displayImage}
            alt={alt}
            fill
            sizes="(max-width: 768px) 70vw, 340px"
            className={`shop-image-seamless object-contain object-center transition-all duration-300 ease-out ${
              imageVisible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
            }`}
            priority
          />

          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
              style={{ background: sheenBackground }}
            />
          )}

          {showHotspots &&
            hotspots.map((hotspot, index) => (
              <DeviceHotspot
                key={hotspot.id}
                hotspot={hotspot}
                delay={0.15 + index * 0.12}
                accentColor={accentColor}
              />
            ))}
        </motion.div>
      </div>
    </div>
  );
}
