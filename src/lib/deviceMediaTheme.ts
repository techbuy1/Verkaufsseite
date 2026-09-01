/**
 * Ableitung einer ruhigen, hochwertigen Bildumgebung aus der Gerätefarbe.
 *
 * Die Produktrenders (Vorder-/Rückseite) liegen als WebP auf **weißem**
 * Hintergrund vor – kein Alpha. Statt die Bilder aufwendig freizustellen,
 * wird die Bildfläche pro Farbe dezent eingefärbt und das Bild per
 * `mix-blend-mode: multiply` gerendert: reines Weiß × Flächenfarbe = die
 * Flächenfarbe selbst, das Gerät bleibt stehen. Dadurch verschwindet die
 * harte Freistellkante vollständig – kein sichtbarer Kasten, kein Saum.
 *
 * Diese Datei berührt ausschließlich die Darstellung. Keine Preis-,
 * Warenkorb- oder Checkout-Logik.
 */

export interface DeviceMediaTheme {
  /** Flächen-Hintergrund der gesamten Bildbühne (weicher Verlauf). */
  surface: string;
  /** Weiche elliptische Auflageschatten-Fläche unter dem Gerät. */
  contactShadow: string;
  /** Farbe, zu der das Apple-Logo auf der Rückseite harmonisch getönt wird. */
  logoTint: string;
  /** Sattere Gerätefarbe – unteres Ende des Display-Verlaufs (Vorderseite). */
  screenGlow: string;
  /** Dunkler Gerät-Ton – oberes Ende des Display-Verlaufs (Vorderseite). */
  screenBase: string;
  /** Rahmen-/Titan-Ton für den nachgezeichneten Geräterahmen (Vorderseite). */
  frameTint: string;
  /** true, wenn die Gerätefarbe sehr dunkel ist (z. B. Schwarz). */
  isDeepColor: boolean;
  /** true, wenn ein gültiger Farb-Hex vorlag (kein neutraler Fallback). */
  hasColor: boolean;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

const NEUTRAL_HSL: Hsl = { h: 220, s: 5, l: 60 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseHex(hex: string | undefined | null): Hsl | null {
  if (!hex) return null;
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hsl(h: number, s: number, l: number, alpha = 1): string {
  const sc = clamp(Math.round(s), 0, 100);
  const lc = clamp(Math.round(l), 0, 100);
  return alpha >= 1
    ? `hsl(${Math.round(h)} ${sc}% ${lc}%)`
    : `hsl(${Math.round(h)} ${sc}% ${lc}% / ${alpha})`;
}

/**
 * Baut aus einem Farb-Hex (z. B. `#e8622a` Cosmic Orange) eine ruhige,
 * helle Bildumgebung. Ungültige / fehlende Werte fallen auf ein neutrales
 * Grau zurück (entspricht der bisherigen Darstellung).
 */
export function getDeviceMediaTheme(hex?: string | null): DeviceMediaTheme {
  const parsed = parseHex(hex);
  const base = parsed ?? NEUTRAL_HSL;
  const isDeepColor = base.l <= 24;

  // Dezente Sättigung – nie knallig, immer ruhig.
  const surfSat = base.s < 6 ? 4 : clamp(base.s * 0.5, 8, 22);

  const centre = hsl(base.h, surfSat, 96.5);
  const mid = hsl(base.h, surfSat, 93);
  const edge = hsl(base.h, surfSat + 4, 87.5);

  const surface = `radial-gradient(135% 118% at 50% 28%, ${centre} 0%, ${mid} 46%, ${edge} 100%)`;

  const shadowHue = base.h;
  const contactShadow = `radial-gradient(ellipse 58% 44% at 50% 50%, ${hsl(
    shadowHue,
    clamp(base.s * 0.4, 8, 26),
    isDeepColor ? 20 : 32,
    0.16,
  )} 0%, ${hsl(shadowHue, 20, 30, 0)} 70%)`;

  // Logo-Tönung: hellere, noch farbige Variante der Gerätefarbe – bei
  // Silber/Weiß nahezu neutral, bei Cosmic Orange ein helles Kupfer.
  const logoTint = hsl(
    base.h,
    base.s < 8 ? 6 : clamp(base.s * 0.85, 14, 62),
    clamp(base.l + 24, 46, 82),
  );

  // Display-Verlauf: statt des mitgerenderten Wallpapers ein sauberer,
  // deckender Verlauf – unten die Gerätefarbe, oben ins dunkle Gerät-Ton
  // auslaufend. `screenGlow` = Farbe unten, `screenBase` = dunkel oben.
  const screenGlow = hsl(
    base.h,
    base.s < 8 ? 12 : clamp(base.s, 34, 84),
    clamp(base.l, 34, 52),
  );
  const screenBase = hsl(base.h, base.s < 8 ? 8 : clamp(base.s * 0.6, 10, 40), 7);

  // Rahmen-/Titan-Ton: mittlere Helligkeit, gedämpfte Sättigung.
  const frameTint = hsl(
    base.h,
    base.s < 8 ? 6 : clamp(base.s * 0.7, 12, 55),
    clamp(base.l + 8, 42, 74),
  );

  return {
    surface,
    contactShadow,
    logoTint,
    screenGlow,
    screenBase,
    frameTint,
    isDeepColor,
    hasColor: parsed !== null,
  };
}
