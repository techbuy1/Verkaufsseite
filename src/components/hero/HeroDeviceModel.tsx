"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";

const DeviceViewer3D = dynamic(
  () => import("@/components/product3d/DeviceViewer3D").then((mod) => mod.DeviceViewer3D),
  { ssr: false, loading: () => null },
);

interface HeroDeviceModelProps {
  slug: string;
  ariaLabel: string;
  modelPath: string;
  colorModelPath?: string;
  colorHex: string;
  fallbackImage: string;
  fallbackImageAlt: string;
  viewCycleSeconds?: number;
  glowColor: string;
  floatDuration: number;
  floatDelay: number;
  sizeClassName: string;
  zIndex: number;
  reducedMotion: boolean;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  tiltStrength: number;
}

/**
 * Real GLB product model (same ones the product pages already load and
 * render) as a decorative, non-interactive hero visual — genuine device
 * thickness, frame and lighting instead of an approximated flat cut-out.
 * Loaded client-only (`ssr:false`) so there is nothing for the server and
 * client to disagree about during hydration.
 */
export function HeroDeviceModel({
  slug,
  ariaLabel,
  modelPath,
  colorModelPath,
  colorHex,
  fallbackImage,
  fallbackImageAlt,
  viewCycleSeconds,
  glowColor,
  floatDuration,
  floatDelay,
  sizeClassName,
  zIndex,
  reducedMotion,
  pointerX,
  pointerY,
  tiltStrength,
}: HeroDeviceModelProps) {
  const tiltY = useTransform(pointerX, (v) => v * tiltStrength);
  const tiltX = useTransform(pointerY, (v) => -v * tiltStrength * 0.55);
  const springTiltY = useSpring(tiltY, { stiffness: 80, damping: 16, mass: 0.5 });
  const springTiltX = useSpring(tiltX, { stiffness: 80, damping: 16, mass: 0.5 });

  return (
    <div className={`absolute aspect-[3/4] ${sizeClassName}`} style={{ zIndex }}>
      <div
        className="pointer-events-none absolute inset-[-35%] rounded-full opacity-[0.16] blur-[70px]"
        style={{ background: glowColor }}
        aria-hidden="true"
      />
      <motion.div
        className="relative h-full w-full"
        animate={reducedMotion ? undefined : { y: [0, -7, 0, 8, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="h-full w-full"
          style={{
            rotateY: reducedMotion ? 0 : springTiltY,
            rotateX: reducedMotion ? 0 : springTiltX,
            transformPerspective: 1200,
          }}
          whileHover={{ scale: 1.025 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link href={`/products/${slug}`} aria-label={ariaLabel} className="block h-full w-full">
            <DeviceViewer3D
              modelPath={modelPath}
              colorModelPath={colorModelPath}
              colorHex={colorHex}
              accentColor="#20a968"
              fallbackImage={fallbackImage}
              fallbackImageAlt={fallbackImageAlt}
              viewCycleSeconds={viewCycleSeconds}
              hideControls
              className="h-full w-full"
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
