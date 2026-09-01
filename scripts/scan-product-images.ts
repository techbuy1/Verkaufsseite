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

function walkImages(dir: string, base = "images/products"): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = `${base}/${entry.name}`;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkImages(full, rel));
    } else if (IMAGE_EXT.test(entry.name)) {
      files.push(rel);
    }
  }
  return files;
}

const registryPaths = new Set<string>();
for (const colors of Object.values(PRODUCT_IMAGE_REGISTRY)) {
  for (const color of colors) {
    for (const rel of [color.file, ...(color.angles ?? [])]) {
      registryPaths.add(rel.normalize("NFC"));
      registryPaths.add(rel.normalize("NFD"));
    }
  }
}

function isRegistered(file: string): boolean {
  const nfc = file.normalize("NFC");
  const nfd = file.normalize("NFD");
  return registryPaths.has(nfc) || registryPaths.has(nfd);
}

const allFiles = walkImages(productsRoot).sort();
const unassigned: string[] = [];
const uncertain: { file: string; reason: string; slug?: string }[] = [];
const ok: string[] = [];

for (const file of allFiles) {
  if (isRegistered(file)) {
    ok.push(file);
    continue;
  }

  const parsed = parseProductImagePath(file);
  if (parsed.confidence === "exact" && parsed.slug && parsed.colorId) {
    uncertain.push({
      file,
      slug: parsed.slug,
      reason: `Scheint ${parsed.slug}/${parsed.colorId} zu sein, ist aber nicht im Registry-Mapping`,
    });
    continue;
  }

  if (parsed.confidence === "uncertain") {
    uncertain.push({
      file,
      slug: parsed.slug ?? undefined,
      reason: parsed.reason ?? "Farbe unsicher",
    });
    continue;
  }

  unassigned.push(file);
}

console.log("=== Produktbild-Scan ===\n");
console.log(`Dateien gesamt: ${allFiles.length}`);
console.log(`Im Registry gemappt: ${ok.length}`);
console.log(`Unzugeordnet: ${unassigned.length}`);
console.log(`Unsicher / nicht im Registry: ${uncertain.length}\n`);

if (ok.length) {
  console.log("OK (Registry):");
  for (const file of ok) console.log(`  ✓ ${file}`);
  console.log("");
}

if (uncertain.length) {
  console.log("UNSICHER / fehlt im Registry:");
  for (const item of uncertain) {
    console.log(`  ? ${item.file}${item.slug ? ` → ${item.slug}` : ""} — ${item.reason}`);
  }
  console.log("");
}

if (unassigned.length) {
  console.log("UNZUGEORDNETE PRODUKTBILDER:");
  for (const file of unassigned) console.log(`  - ${file}`);
  console.log("");
}

const slugsWithoutMeta = Object.keys(PRODUCT_IMAGE_REGISTRY).filter((slug) => !PRODUCT_IMAGE_META[slug]);
if (slugsWithoutMeta.length) {
  console.log("Registry ohne Meta:");
  for (const slug of slugsWithoutMeta) console.log(`  - ${slug}`);
}

export { unassigned, uncertain, allFiles };
