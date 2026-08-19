import { NextResponse } from "next/server";
import { accessoryProducts } from "@/data/accessoryCatalog";
import { validateCheckoutStock } from "@/lib/productAvailability";
import { getSeedProducts } from "@/lib/productStore";
import { isConditionId } from "@/lib/conditions";
import { getDefaultAvailableConditionId } from "@/lib/productAvailability";
import {
  getDefaultColor,
  getDefaultStorage,
  getProductPrice,
} from "@/lib/productVariants";
import type { ConditionId } from "@/types/product";

interface CheckoutItemPayload {
  productId: string;
  lineId?: string;
  quantity: number;
  colorId?: string;
  colorName?: string;
  color?: string;
  storage?: string;
  condition?: ConditionId | string;
  conditionLabel?: string;
  price?: number;
}

function resolveVariantPrice(item: CheckoutItemPayload): number | null {
  const premium = getSeedProducts().find((product) => product.id === item.productId);
  if (premium) {
    const colorRef = item.colorId ?? item.color ?? item.colorName;
    const colorId =
      (colorRef
        ? premium.images.find(
            (image) => image.id === colorRef || image.colorName === colorRef,
          )?.id
        : undefined) ?? getDefaultColor(premium).id;
    const storage =
      item.storage ?? getDefaultStorage(premium, colorId).storage;
    const condition = isConditionId(item.condition)
      ? item.condition
      : getDefaultAvailableConditionId(premium, colorId, storage);
    return getProductPrice(premium, storage, colorId, condition);
  }

  const accessory = accessoryProducts.find((product) => product.id === item.productId);
  return accessory?.price ?? null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { items?: CheckoutItemPayload[] };
  const items = body.items ?? [];

  if (items.length === 0) {
    return NextResponse.json({ message: "Warenkorb ist leer." }, { status: 400 });
  }

  const products = getSeedProducts();
  const stockErrors = validateCheckoutStock(items, products);

  if (stockErrors.length > 0) {
    return NextResponse.json(
      {
        message: stockErrors[0]?.message ?? "Nicht genügend Bestand verfügbar.",
        errors: stockErrors,
      },
      { status: 409 },
    );
  }

  const lineItems = items
    .map((item) => {
      if (item.quantity < 1) return null;

      const variantPrice = resolveVariantPrice(item);
      const price = variantPrice ?? item.price ?? 0;
      if (price <= 0) return null;

      const premium = products.find((product) => product.id === item.productId);
      const accessory = accessoryProducts.find((product) => product.id === item.productId);
      const name = premium?.name ?? accessory?.name;
      if (!name) return null;

      return {
        id: item.productId,
        lineId: item.lineId,
        name,
        price,
        quantity: item.quantity,
        color: item.colorName ?? item.color,
        storage: item.storage,
        condition: item.condition,
        conditionLabel: item.conditionLabel,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (lineItems.length === 0) {
    return NextResponse.json({ message: "Ungültige Produkte im Warenkorb." }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Stripe Checkout ist noch nicht konfiguriert. Der Warenkorb ist bereit für die serverseitige Übergabe.",
      lineItems,
      stockValidated: true,
    },
    { status: 200 },
  );
}
