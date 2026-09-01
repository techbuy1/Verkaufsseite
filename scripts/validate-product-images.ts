import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRODUCT_IMAGE_META,
  PRODUCT_IMAGE_REGISTRY,
} from "../src/data/productImageRegistry.ts";
import { parseProductImagePath } from "./lib/productImageScanner.ts";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const productsRoot = path.join(publicDir, "images/products");
const IMAGE_EXT = /\.(png|jpe?g|webp|avif)$/i;

const BRAND_PATH_HINTS: Record<string, string[]> = {
  Apple: ["images/products/Apple/"],
  Samsung: ["images/products/Samsung "],
  Google: ["images/products/Google Pixel "],
};

function normalizeRelPath(value: string): string {
  return value.normalize("NFC");
}

function fileExists(relativePath: string): boolean {
  const normalized = normalizeRelPath(relativePath);
  const fullPath = path.join(publicDir, normalized);
  if (fs.existsSync(fullPath)) return true;

  const nfdPath = path.join(publicDir, normalized.normalize("NFD"));
  return fs.existsSync(nfdPath);
}

function walkImages(dir: string, base = "images/products"): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = normalizeRelPath(`${base}/${entry.name}`);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkImages(full, rel));
    else if (IMAGE_EXT.test(entry.name)) files.push(rel);
  }
  return files;
}

const issues: string[] = [];
const okLines: string[] = [];
const missingLines: string[] = [];
const uncertainLines: string[] = [];
const seenPaths = new Map<string, string>();

for (const [slug, colors] of Object.entries(PRODUCT_IMAGE_REGISTRY)) {
  const meta = PRODUCT_IMAGE_META[slug];
  if (!meta) {
    issues.push(`[missing_meta] ${slug}: Keine Metadaten hinterlegt`);
    continue;
  }

  for (const color of colors) {
    const rel = normalizeRelPath(color.file);
    if (!fileExists(rel)) {
      issues.push(`[missing_file] ${slug}/${color.id}: ${color.file}`);
      continue;
    }

    const brandHints = [...(BRAND_PATH_HINTS[meta.brand] ?? []), `images/products/${slug}/`];
    if (brandHints.length && !brandHints.some((hint) => rel.includes(hint))) {
      issues.push(`[cross_brand] ${slug}/${color.id}: ${color.file}`);
    }

    for (const angle of color.angles ?? []) {
      if (!fileExists(normalizeRelPath(angle))) {
        issues.push(`[missing_angle] ${slug}/${color.id}: ${angle}`);
      }
    }

    const prev = seenPaths.get(rel);
    if (prev && prev !== `${slug}/${color.id}`) {
      issues.push(`[duplicate] ${color.file} → ${prev} und ${slug}/${color.id}`);
    } else {
      seenPaths.set(rel, `${slug}/${color.id}`);
    }

    okLines.push(`${meta.model} / ${color.name}`);
  }
}

const registryPaths = new Set(
  Object.values(PRODUCT_IMAGE_REGISTRY).flatMap((colors) =>
    colors.flatMap((color) => [color.file, ...(color.angles ?? [])].map(normalizeRelPath)),
  ),
);

for (const file of walkImages(productsRoot)) {
  const normalized = normalizeRelPath(file);
  const matchedRegistry = [...registryPaths].some(
    (registryPath) =>
      registryPath === normalized ||
      registryPath.normalize("NFD") === normalized.normalize("NFD"),
  );
  if (matchedRegistry) continue;

  const parsed = parseProductImagePath(file);
  if (parsed.confidence === "unassigned") {
    uncertainLines.push(`${file} — ${parsed.reason ?? "Unzugeordnet"}`);
  } else if (parsed.confidence === "uncertain") {
    uncertainLines.push(`${file} — ${parsed.reason ?? "Farbe unsicher"}`);
  } else if (parsed.slug && parsed.colorId) {
    uncertainLines.push(
      `${file} — Datei passt zu ${parsed.slug}/${parsed.colorId}, fehlt aber im Registry`,
    );
  }
}

console.log("=== Produktbild-Validierung ===\n");

if (okLines.length) {
  console.log("OK:");
  for (const line of okLines) console.log(`  ✓ ${line}`);
  console.log("");
}

if (missingLines.length) {
  console.log("FEHLT (kein verifiziertes Bild im Registry):");
  for (const line of missingLines) console.log(`  ✗ ${line}`);
  console.log("");
}

if (uncertainLines.length) {
  console.log("UNZUGEORDNET / UNSICHER:");
  for (const line of uncertainLines) console.log(`  ? ${line}`);
  console.log("");
}

if (issues.length) {
  console.error("FEHLER:\n" + issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}

console.log("✓ Produktbild-Validierung erfolgreich (keine harten Fehler)");
