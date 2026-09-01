"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { ProductImageVariant } from "@/types/product";
import type { ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { getDeviceMediaTheme, type DeviceMediaTheme } from "@/lib/deviceMediaTheme";
import { ProductImage } from "../ProductImage";
import {
  DeviceLogoTint,
  DeviceScreenTint,
  getLogoGeometry,
  getScreenGeometry,
  type LogoGeometry,
  type ScreenGeometry,
} from "./DeviceRenderOverlays";

interface ProductGalleryProps {
  images: ProductImageVariant[];
  alt: string;
  /** Index der ausgewählten Farbe innerhalb `images`. */
  activeIndex?: number;
  /** Illustrierter Fallback, wenn keine echte Produktfotografie vorliegt. */
  fallbackType?: ProductImageType;
  /** Marke – steuert u. a. die Apple-Logo-Tönung auf der Rückseite. */
  brand?: string;
  /** Produkt-Slug – für die Logo-Geometrie der Rückseiten-Renders. */
  productSlug?: string;
}

interface RenderOverlays {
  logo?: { tint: string; geometry: LogoGeometry };
  screenTint?: { glow: string; base: string; frame: string; geometry: ScreenGeometry };
}

interface DeviceRenderProps extends RenderOverlays {
  src: string;
  alt: string;
  theme: DeviceMediaTheme;
  fallbackType?: ProductImageType;
  priority?: boolean;
  sizes: string;
}

/**
 * Die eigentliche Gerätedarstellung: weißer Render-Hintergrund via `multiply`
 * nahtlos in der eingefärbten Fläche, weicher Auflageschatten, plus die
 * farbabhängigen Overlays (Display-Verlauf vorne, Apple-Logo hinten).
 */
const DeviceRender = memo(function DeviceRender({
  src,
  alt,
  theme,
  fallbackType,
  priority = false,
  sizes,
  logo,
  screenTint,
}: DeviceRenderProps) {
  if (src === VARIANT_IMAGE_PLACEHOLDER && fallbackType) {
    return (
      <div className="absolute inset-0">
        <ProductImage type={fallbackType} className="h-full w-full" />
      </div>
    );
  }

  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[14%] bottom-[8%] h-[24%]"
        style={{ background: theme.contactShadow }}
      />
      {/* Kein `filter` auf dem Bild – das würde den Blendmodus aufheben. */}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        placeholder="empty"
        className="object-contain object-center"
        style={{ mixBlendMode: "multiply" }}
      />
      {screenTint ? (
        <DeviceScreenTint
          glow={screenTint.glow}
          base={screenTint.base}
          frame={screenTint.frame}
          geometry={screenTint.geometry}
        />
      ) : null}
      {logo ? <DeviceLogoTint tint={logo.tint} geometry={logo.geometry} /> : null}
    </>
  );
});

interface ViewShotProps extends DeviceRenderProps {
  label: string;
  zoomable: boolean;
  onZoom: () => void;
}

const ZoomIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
  </svg>
);

const ViewShot = memo(function ViewShot({
  label,
  zoomable,
  onZoom,
  ...render
}: ViewShotProps) {
  const boxClass =
    "group relative mx-auto block aspect-[3/4] w-full max-w-[440px]";

  const inner = (
    <>
      <DeviceRender {...render} />
      {zoomable ? (
        <span
          aria-hidden
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#1d1d1f] opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100"
        >
          {ZoomIcon}
        </span>
      ) : null}
    </>
  );

  return (
    <figure className="min-w-0">
      {/* Container exakt im Seitenverhältnis der Renders (3:4), damit die
          Overlay-Geometrie deckungsgleich sitzt. */}
      {zoomable ? (
        <button
          type="button"
          onClick={onZoom}
          aria-label={`${render.alt} vergrößern`}
          className={`${boxClass} cursor-zoom-in`}
        >
          {inner}
        </button>
      ) : (
        <div className={boxClass}>{inner}</div>
      )}
      <figcaption className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-[#86868b]">
        {label}
      </figcaption>
    </figure>
  );
});

interface ZoomModalProps {
  views: { key: string; label: string; render: DeviceRenderProps }[];
  activeKey: string;
  surface: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

function ZoomModal({ views, activeKey, surface, onSelect, onClose }: ZoomModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const active = views.find((v) => v.key === activeKey) ?? views[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${active.render.alt} – vergrößerte Ansicht`}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ background: surface }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#1d1d1f] shadow-sm backdrop-blur transition hover:bg-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>

      <div
        className="relative aspect-[3/4] w-full max-w-[min(92vw,64vh)] cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <DeviceRender {...active.render} priority sizes="(max-width: 640px) 92vw, 64vh" />
      </div>

      {views.length > 1 ? (
        <div className="mt-6 flex gap-2" onClick={(e) => e.stopPropagation()} role="presentation">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => onSelect(v.key)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] transition ${
                v.key === active.key
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white/70 text-[#1d1d1f] hover:bg-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const ProductGallery = memo(function ProductGallery({
  images,
  alt,
  activeIndex = 0,
  fallbackType,
  brand,
  productSlug,
}: ProductGalleryProps) {
  const colorIndex = images[activeIndex] ? activeIndex : 0;
  const color = images[colorIndex];

  const [zoomKey, setZoomKey] = useState<string | null>(null);
  const closeZoom = useCallback(() => setZoomKey(null), []);

  const { front, back } = useMemo(() => {
    const nextFront = color.image;
    const extra = color.angles?.filter((angle) => angle && angle !== nextFront) ?? [];
    return { front: nextFront, back: extra[0] };
  }, [color]);

  const theme = useMemo(() => getDeviceMediaTheme(color.colorCode), [color.colorCode]);

  const isPrimaryColor = colorIndex === 0;
  const isApple = (brand ?? "").toLowerCase() === "apple";
  const logoGeometry = isApple ? getLogoGeometry(productSlug) : undefined;
  const screenGeometry = isApple ? getScreenGeometry(productSlug) : undefined;

  const backLogo =
    logoGeometry && back ? { tint: theme.logoTint, geometry: logoGeometry } : undefined;
  const frontScreenTint =
    screenGeometry && theme.hasColor
      ? {
          glow: theme.screenGlow,
          base: theme.screenBase,
          frame: theme.frameTint,
          geometry: screenGeometry,
        }
      : undefined;

  const sizes = "(max-width: 1024px) 88vw, 460px";

  const frontRender: DeviceRenderProps = {
    src: front,
    alt: `${alt} – ${color.colorName} Vorderseite`,
    theme,
    fallbackType,
    priority: isPrimaryColor,
    sizes,
    screenTint: frontScreenTint,
  };
  const backRender: DeviceRenderProps | undefined = back
    ? {
        src: back,
        alt: `${alt} – ${color.colorName} Rückseite`,
        theme,
        fallbackType,
        sizes,
        logo: backLogo,
      }
    : undefined;

  const isFallback = front === VARIANT_IMAGE_PLACEHOLDER;
  const zoomable = !isFallback;

  const zoomViews = useMemo(() => {
    const list: { key: string; label: string; render: DeviceRenderProps }[] = [
      { key: "front", label: "Vorderseite", render: frontRender },
    ];
    if (backRender) list.push({ key: "back", label: "Rückseite", render: backRender });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, back, theme]);

  return (
    <div
      className="w-full rounded-[28px] px-4 py-8 sm:px-8 sm:py-10"
      style={{ background: theme.surface }}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 sm:gap-8">
        <ViewShot
          {...frontRender}
          label="Vorderseite"
          zoomable={zoomable}
          onZoom={() => setZoomKey("front")}
        />
        {backRender ? (
          <ViewShot
            {...backRender}
            label="Rückseite"
            zoomable={zoomable}
            onZoom={() => setZoomKey("back")}
          />
        ) : null}
      </div>

      {zoomKey ? (
        <ZoomModal
          views={zoomViews}
          activeKey={zoomKey}
          surface={theme.surface}
          onSelect={setZoomKey}
          onClose={closeZoom}
        />
      ) : null}
    </div>
  );
});
