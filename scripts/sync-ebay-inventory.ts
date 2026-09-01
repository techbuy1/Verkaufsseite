import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMinimalEbayCatalog,
  calculateTechBuyPrice,
  EBAY_INVENTORY,
} from "./lib/buildEbayCatalog.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, "../src/data/server-catalog.json");

const products = buildMinimalEbayCatalog();
writeFileSync(outFile, JSON.stringify(products, null, 2), "utf8");

console.log(`✓ ${products.length} eBay-Produkte nach ${outFile} geschrieben\n`);
console.log("Preisübersicht (eBay → berechnet → TechBuy):");
for (const row of EBAY_INVENTORY) {
  const pricing = calculateTechBuyPrice(row.ebay_price);
  const product = products.find((entry) => entry.ebayItemId === row.ebay_item_id);
  console.log(
    `${row.ebay_item_id} | ${pricing.ebay_price.toFixed(2)} → ${pricing.calculated_price.toFixed(2)} → ${product?.techbuyPrice?.toFixed(2) ?? "?"} €`,
  );
}
