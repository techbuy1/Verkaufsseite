import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Muss mit src/data/heroImageAssets.ts übereinstimmen. */
const HERO_IMAGE_FILES = [
  "iPhone17Pro_Lineup .png",
  "iPhone17_Lineup .png",
  "Samsung_Galaxy_S26_Ultra_Lineup.png",
  "GooglePixel_Modelle .png",
] as const;

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const heroDir = path.join(publicDir, "images", "hero");

const issues: string[] = [];
const mappedFiles = new Set<string>(HERO_IMAGE_FILES);

if (!fs.existsSync(heroDir)) {
  console.error("Hero-Ordner fehlt: public/images/hero");
  process.exit(1);
}

const diskFiles = fs
  .readdirSync(heroDir)
  .filter((file) => /\.(png|jpe?g|webp)$/i.test(file));

for (const file of HERO_IMAGE_FILES) {
  const fullPath = path.join(heroDir, file);
  if (!fs.existsSync(fullPath)) {
    issues.push(`[missing_file] Karussell-Bild fehlt: ${file}`);
  }
}

for (const file of diskFiles) {
  if (!mappedFiles.has(file)) {
    issues.push(`[unmapped] Datei im Hero-Ordner ohne Karussell-Zuordnung: ${file}`);
  }
}

if (issues.length > 0) {
  console.error("Hero-Bild-Validierung fehlgeschlagen:\n" + issues.map((i) => `- ${i}`).join("\n"));
  process.exit(1);
}

console.log(`✓ Hero-Bild-Validierung erfolgreich (${diskFiles.length} Dateien)`);
