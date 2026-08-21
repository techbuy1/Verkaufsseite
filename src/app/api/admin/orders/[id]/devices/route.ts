import { NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin/auth";
import { isTaxMode, type TaxMode } from "@/lib/companySettings";
import {
  findOrderById,
  normalizeOrderItems,
  updateOrder,
  type ShopOrderDevice,
  type ShopOrderItem,
} from "@/lib/orderStore";

export const runtime = "nodejs";

interface DevicePatch {
  id: string;
  imei?: string | null;
  serialNumber?: string | null;
  taxMode?: TaxMode | null;
  purchasePrice?: number | null;
}

interface ItemPatch {
  productId: string;
  /** Match by index when multiple identical products exist. */
  itemIndex: number;
  devices: DevicePatch[];
}

/** Save IMEI / serial / tax mode / purchase price per device. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSessionFromRequest(request))) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ message: "Bestellung nicht gefunden." }, { status: 404 });
  }

  if (order.invoiceNumber) {
    return NextResponse.json(
      {
        message:
          "Rechnung wurde bereits erstellt. Geräte-/Steuerdaten können nicht mehr geändert werden.",
      },
      { status: 409 },
    );
  }

  let body: { items?: ItemPatch[] };
  try {
    body = (await request.json()) as { items?: ItemPatch[] };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const patches = body.items ?? [];
  const items = normalizeOrderItems(order.items).map((item, itemIndex) => {
    const patch = patches.find(
      (entry) =>
        entry.itemIndex === itemIndex && entry.productId === item.productId,
    );
    if (!patch) return item;

    const devices: ShopOrderDevice[] = item.devices.map((device) => {
      const devicePatch = patch.devices.find((entry) => entry.id === device.id);
      if (!devicePatch) return device;

      const taxMode =
        devicePatch.taxMode === null
          ? null
          : isTaxMode(devicePatch.taxMode)
            ? devicePatch.taxMode
            : device.taxMode ?? null;

      const purchasePrice =
        devicePatch.purchasePrice === undefined
          ? device.purchasePrice ?? null
          : devicePatch.purchasePrice === null ||
              Number.isFinite(devicePatch.purchasePrice)
            ? devicePatch.purchasePrice
            : device.purchasePrice ?? null;

      return {
        ...device,
        imei:
          devicePatch.imei !== undefined
            ? devicePatch.imei?.trim() || null
            : device.imei ?? null,
        serialNumber:
          devicePatch.serialNumber !== undefined
            ? devicePatch.serialNumber?.trim() || null
            : device.serialNumber ?? null,
        taxMode,
        purchasePrice,
      };
    });

    const next: ShopOrderItem = {
      ...item,
      devices,
      // Keep line-level hint in sync with first device if all equal
      taxMode:
        devices.every((d) => d.taxMode === devices[0]?.taxMode)
          ? devices[0]?.taxMode ?? null
          : null,
    };
    return next;
  });

  const updated = await updateOrder(order.id, { items });
  return NextResponse.json({ ok: true, order: updated });
}
