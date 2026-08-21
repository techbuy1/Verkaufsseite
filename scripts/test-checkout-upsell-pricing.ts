/**
 * Serverseitiger Smoke-Test für Checkout-Upsell-Preise (ohne Zahlung).
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-checkout-upsell-pricing.ts
 */
import {
  UPSELL_BUNDLE_PRICES_CENTS,
  UPSELL_ITEM_PRICES_CENTS,
  priceAllDeviceUpsells,
  type DeviceUpsellSelectionInput,
} from "../src/lib/checkoutUpsell.ts";

const devices = [
  {
    lineId: "line-iphone-17-pro",
    productId: "offer-iphone",
    productName: "iPhone 17 Pro",
  },
  {
    lineId: "line-iphone-16",
    productId: "apple-iphone-16",
    productName: "iPhone 16",
  },
];

const selections: DeviceUpsellSelectionInput[] = [
  {
    cartLineId: "line-iphone-17-pro",
    mode: "bundle",
    bundleId: "complete",
    screenProtector: "privacy",
  },
  {
    cartLineId: "line-iphone-16",
    mode: "singles",
    screenProtector: "normal",
    transparentCase: true,
  },
];

const result = priceAllDeviceUpsells(selections, devices);
if (!result.ok) {
  console.error(result.message);
  process.exit(1);
}

const complete = result.priced.find((row) => row.cartLineId === "line-iphone-17-pro");
const singles = result.priced.find((row) => row.cartLineId === "line-iphone-16");

const checks = {
  completePrice: complete?.lineTotalCents === UPSELL_BUNDLE_PRICES_CENTS.complete,
  completeGlassPrivacy: complete?.items.some(
    (item) => item.type === "screen_protector" && item.variant === "privacy",
  ),
  completeBoundToDevice: complete?.items.every(
    (item) =>
      item.type === "usb_c_cable" ||
      item.type === "charger_60w" ||
      item.compatibleProduct === "iPhone 17 Pro",
  ),
  singlesPrice:
    singles?.lineTotalCents ===
    UPSELL_ITEM_PRICES_CENTS.screen_protector +
      UPSELL_ITEM_PRICES_CENTS.transparent_case,
  noClientPriceTrust: true,
};

// Tamper attempt: fake bundle price must be ignored (pricing uses constants only)
const tampered = priceAllDeviceUpsells(
  [
    {
      cartLineId: "line-iphone-17-pro",
      mode: "bundle",
      bundleId: "complete",
      screenProtector: "normal",
      // @ts-expect-error intentional junk
      unitPrice: 1,
    },
  ],
  [devices[0]],
);

const tamperOk =
  tampered.ok &&
  tampered.priced[0]?.lineTotalCents === UPSELL_BUNDLE_PRICES_CENTS.complete;

console.log({ checks, tamperOk, priced: result.priced.map((p) => ({
  name: p.displayName,
  cents: p.lineTotalCents,
  items: p.items.map((i) => i.label),
})) });

if (!Object.values(checks).every(Boolean) || !tamperOk) {
  console.error("FAILED");
  process.exit(1);
}

console.log("OK: Upsell pricing is server-authoritative and device-bound");
