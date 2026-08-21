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
  /** Overrides the default `/products/${slug}` destination — e.g. an external trade-in flow. */
  href?: string;
  ariaLabel: string;
  modelPath: string;
  colorModelPath?: string;
  colorHex: string;
  fallbackImage: string;
  fallbackImageAlt: string;
  viewCycleSeconds?: number;
  /** 60/speed = seconds per full turn. Hero context defaults faster than the product-page viewer so a complete rotation is clearly visible within a slide's dwell time. */
  autoRotateSpeed?: number;
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
  href,
  ariaLabel,
  modelPath,
  colorModelPath,
  colorHex,
  fallbackImage,
  fallbackImageAlt,
  viewCycleSeconds,
  autoRotateSpeed = 10,
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
    // A real phone is much taller than 3:4 — a box that shape gives the
    // camera-framing logic in Scene3D room to fit the full device (top to
    // bottom) without the sides pushing outside the stage, since it fits
    // the box's actual height rather than an approximated squarer one.
    //
    // `relative` (not `absolute`) is deliberate: callers position this
    // component by wrapping it in an `absolute; left/top` anchor div — a
    // zero-size point at the desired spot. Centering this element ON that
    // point needs `-translate-x-1/2 -translate-y-1/2`, and CSS `translate`
    // percentages resolve against the *translated element's own* box. If
    // this div were `absolute` too, it would sit in that zero-size anchor's
    // box and the translate would compute against a 0×0 reference — moving
    // nothing — which is exactly the bug that let this render full-size but
    // pinned at its untranslated top-left, overflowing past the stage.
    <div
      className={`relative aspect-[3/5] -translate-x-1/2 -translate-y-1/2 ${sizeClassName}`}
      style={{ zIndex }}
    >
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
          <Link
            href={href ?? `/products/${slug}`}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={ariaLabel}
            className="block h-full w-full touch-pan-y"
            style={{ touchAction: "pan-y" }}
          >
            <DeviceViewer3D
              modelPath={modelPath}
              colorModelPath={colorModelPath}
              colorHex={colorHex}
              accentColor="#20a968"
              fallbackImage={fallbackImage}
              fallbackImageAlt={fallbackImageAlt}
              viewCycleSeconds={viewCycleSeconds}
              autoRotateSpeed={autoRotateSpeed}
              hideControls
              presentationOnly
              className="h-full w-full"
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
