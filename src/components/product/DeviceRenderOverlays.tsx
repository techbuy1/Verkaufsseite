"use client";

/**
 * Farb-Overlays für die statischen Geräte-Renders (iPhone 17 Pro / Pro Max):
 *
 * - `DeviceLogoTint`  – tönt das neutral-graue Apple-Logo auf der Rückseite
 *   harmonisch zur Gerätefarbe (Blendmodus `color`).
 * - `DeviceScreenTint` – ersetzt auf der Vorderseite das mitgerenderte
 *   Wallpaper komplett durch einen sauberen, deckenden Verlauf: unten die
 *   Gerätefarbe, nach oben in einen dunklen Gerät-Ton auslaufend.
 *
 * Rein visuell – kein Preis-, Warenkorb- oder Checkout-Bezug.
 */

// Klassische Apple-Silhouette, viewBox 0 0 814 1000.
const APPLE_PATH =
  "M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 197.6 100.8zm-233.7-184.3c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.6-71.2z";

const APPLE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 814 1000'><path d='${APPLE_PATH}' fill='#000'/></svg>`,
)}")`;

export interface LogoGeometry {
  /** Horizontale Mitte des Logos, in % der Bildbreite. */
  x: number;
  /** Vertikale Mitte des Logos, in % der Bildhöhe. */
  y: number;
  /** Breite des Logo-Overlays, in % der Bildbreite. */
  width: number;
}

export interface ScreenGeometry {
  /** Linke Kante des Displays, in % der Bildbreite. */
  left: number;
  /** Obere Kante des Displays, in % der Bildhöhe. */
  top: number;
  /** Breite des Displays, in % der Bildbreite. */
  width: number;
  /** Höhe des Displays, in % der Bildhöhe. */
  height: number;
  /** Eckenradius, in % der Overlay-Breite. */
  radius: number;
}

interface RenderGeometry {
  logo: LogoGeometry;
  screen: ScreenGeometry;
}

/**
 * Geometrie der Renders je Produktreihe. iPhone 17 Pro und Pro Max teilen
 * dieselbe Kameraführung, daher identische Werte.
 */
const IPHONE_17_PRO_GEOMETRY: RenderGeometry = {
  logo: { x: 50, y: 62, width: 11 },
  // Aus dem Render gemessen: reine Glasfläche (innerhalb des schwarzen
  // Rands). Der Rahmen wird als dünner Ring separat nachgezeichnet.
  screen: { left: 21.8, top: 4.1, width: 57.2, height: 92.1, radius: 15 },
};

const RENDER_GEOMETRY: Record<string, RenderGeometry> = {
  "iphone-17-pro": IPHONE_17_PRO_GEOMETRY,
  "iphone-17-pro-max": IPHONE_17_PRO_GEOMETRY,
};

export function getLogoGeometry(slug?: string): LogoGeometry | undefined {
  return slug ? RENDER_GEOMETRY[slug]?.logo : undefined;
}

export function getScreenGeometry(slug?: string): ScreenGeometry | undefined {
  return slug ? RENDER_GEOMETRY[slug]?.screen : undefined;
}

export function DeviceLogoTint({
  tint,
  geometry,
}: {
  tint: string;
  geometry: LogoGeometry;
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${geometry.x}%`,
        top: `${geometry.y}%`,
        width: `${geometry.width}%`,
        aspectRatio: "814 / 1000",
        transform: "translate(-50%, -50%)",
        background: tint,
        WebkitMaskImage: APPLE_MASK,
        maskImage: APPLE_MASK,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        mixBlendMode: "color",
        opacity: 0.85,
      }}
    />
  );
}

export function DeviceScreenTint({
  glow,
  base,
  frame,
  geometry,
}: {
  /** Gerätefarbe – unteres Ende des Verlaufs. */
  glow: string;
  /** Dunkler Gerät-Ton – oberes Ende des Verlaufs. */
  base: string;
  /** Titan-/Rahmen-Ton für den nachgezeichneten Rahmen. */
  frame: string;
  geometry: ScreenGeometry;
}) {
  const radiusX = geometry.radius;
  const radiusY = (geometry.radius * geometry.width) / geometry.height;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute overflow-hidden"
      style={{
        left: `${geometry.left}%`,
        top: `${geometry.top}%`,
        width: `${geometry.width}%`,
        height: `${geometry.height}%`,
        borderRadius: `${radiusX}% / ${radiusY}%`,
        // Deckender Verlauf – verdeckt das mitgerenderte Wallpaper komplett.
        background: `linear-gradient(to top, ${glow} 0%, ${base} 72%, ${base} 100%)`,
        // Nachgezeichneter Rahmen: dünner schwarzer Glasrand + Titan-Ring
        // (box-shadow-Spread nimmt keine %, daher feste px – bei den
        // Anzeigegrößen ~3–4 px passend).
        boxShadow: `inset 0 0 0 2px rgba(0,0,0,0.5), 0 0 0 2px ${frame}, 0 0 0 3px rgba(0,0,0,0.28)`,
      }}
    >
      {/* Dynamic Island */}
      <span
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "3.4%",
          width: "30%",
          aspectRatio: "2.5 / 1",
          transform: "translateX(-50%)",
          background: "#050506",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      />
    </span>
  );
}
