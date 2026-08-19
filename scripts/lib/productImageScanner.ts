import {
  PRODUCT_IMAGE_META,
  PRODUCT_IMAGE_REGISTRY,
  type RegistryColorEntry,
} from "../../src/data/productImageRegistry.ts";

function slugifyColorId(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface ParsedProductImage {
  relativePath: string;
  slug: string | null;
  colorId: string | null;
  colorName: string | null;
  confidence: "exact" | "uncertain" | "unassigned";
  reason?: string;
}

export const ORDERED_PRODUCT_SLUGS = Object.entries(PRODUCT_IMAGE_META).sort(
  ([, a], [, b]) => b.model.length - a.model.length,
);

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function modelTokens(model: string): string[] {
  const base = normalizeToken(model);
  const tokens = [base];

  const galaxyMatch = model.match(/Galaxy\s+(A\d+|S\d+)\s*(.*)?/i);
  if (galaxyMatch) {
    const series = galaxyMatch[1]?.toLowerCase();
    const suffix = normalizeToken(galaxyMatch[2] ?? "");
    if (series) tokens.push(`galaxy${series}${suffix}`);
    if (series?.startsWith("a")) tokens.push(`a${series.slice(1)}${suffix}`);
    if (series?.startsWith("s")) tokens.push(`s${series.slice(1)}${suffix}`);
  }

  const pixelMatch = model.match(/Pixel\s+(10a|10\s*Pro\s*XL|10\s*Pro|10|\d+\s*Pro\s*XL|\d+\s*Pro|\d+)/i);
  if (pixelMatch) {
    tokens.push(normalizeToken(`pixel ${pixelMatch[1]}`));
  }

  const iphoneMatch = model.match(/iPhone\s+(.*)/i);
  if (iphoneMatch) {
    tokens.push(normalizeToken(`iphone ${iphoneMatch[1]}`));
    tokens.push(normalizeToken(`iphone${iphoneMatch[1]}`));
  }

  return [...new Set(tokens.filter(Boolean))];
}

function detectSlug(relativePath: string, filename: string): string | null {
  const haystack = normalizeToken(`${relativePath}/${filename}`);
  for (const [slug, meta] of ORDERED_PRODUCT_SLUGS) {
    for (const token of modelTokens(meta.model)) {
      if (token.length >= 4 && haystack.includes(token)) {
        return slug;
      }
    }
  }
  return null;
}

function colorCandidates(filename: string): string[] {
  const base = filename.replace(/\.[^.]+$/, "");
  return [
    base,
    base.replace(/^[^_]+_/, ""),
    base.replace(/^Samsung_Galaxy_[A-Za-z0-9]+_/i, ""),
    base.replace(/^Google_?Pixel_/i, ""),
    base.replace(/^Apple_/i, ""),
    base.replace(/^iPhone/i, ""),
    base.replace(/^17ProMax/i, "17 Pro Max "),
    base.replace(/^S26_Ultra_/i, ""),
    base.replace(/Kopie/gi, ""),
  ];
}

function matchRegistryColor(
  slug: string,
  filename: string,
): { entry: RegistryColorEntry; confidence: "exact" | "uncertain" } | null {
  const colors = PRODUCT_IMAGE_REGISTRY[slug];
  if (!colors?.length) return null;

  const normalizedFile = normalizeToken(filename);
  const candidates = colorCandidates(filename).map(normalizeToken);

  for (const color of colors) {
    const keys = [
      normalizeToken(color.id),
      normalizeToken(color.name),
      normalizeToken(color.name.replace(/^Awesome\s+/i, "")),
    ];
    for (const key of keys) {
      if (key.length >= 3 && candidates.some((c) => c.includes(key) || key.includes(c))) {
        return { entry: color, confidence: "exact" };
      }
      if (key.length >= 3 && normalizedFile.includes(key)) {
        return { entry: color, confidence: "exact" };
      }
    }
  }

  return null;
}

export function parseProductImagePath(relativePath: string): ParsedProductImage {
  const filename = relativePath.split("/").pop() ?? relativePath;
  const slug = detectSlug(relativePath, filename);

  if (!slug) {
    return {
      relativePath,
      slug: null,
      colorId: null,
      colorName: null,
      confidence: "unassigned",
      reason: "Modell nicht eindeutig erkannt",
    };
  }

  const colorMatch = matchRegistryColor(slug, filename);
  if (colorMatch) {
    return {
      relativePath,
      slug,
      colorId: colorMatch.entry.id,
      colorName: colorMatch.entry.name,
      confidence: colorMatch.confidence,
    };
  }

  return {
    relativePath,
    slug,
    colorId: null,
    colorName: null,
    confidence: "uncertain",
    reason: "Farbe nicht eindeutig zuordenbar",
  };
}

export function normalizeColorKey(value: string): string {
  return slugifyColorId(value);
}
