import type { SaleTransaction, SaleTransactionInput } from "@/lib/salesTypes";

const STORAGE_KEY = "techbuy-admin-sales-v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sale-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeSale(raw: Partial<SaleTransaction>): SaleTransaction | null {
  if (!raw || typeof raw !== "object") return null;
  const productName =
    typeof raw.productName === "string" ? raw.productName.trim() : "";
  if (!productName) return null;

  const quantity =
    typeof raw.quantity === "number" && Number.isFinite(raw.quantity)
      ? Math.max(1, Math.floor(raw.quantity))
      : 1;
  const purchasePrice =
    typeof raw.purchasePrice === "number" && Number.isFinite(raw.purchasePrice)
      ? Math.max(0, raw.purchasePrice)
      : 0;
  const salePrice =
    typeof raw.salePrice === "number" && Number.isFinite(raw.salePrice)
      ? Math.max(0, raw.salePrice)
      : 0;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt
        ? raw.createdAt
        : new Date().toISOString(),
    productId: raw.productId?.trim() || undefined,
    productName,
    variantLabel: raw.variantLabel?.trim() || undefined,
    imei: raw.imei?.trim() || undefined,
    purchasePrice,
    salePrice,
    quantity,
    note: raw.note?.trim() || undefined,
    source: raw.source === "checkout" ? "checkout" : "manual",
  };
}

export function loadSales(): SaleTransaction[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeSale(entry as Partial<SaleTransaction>))
      .filter((entry): entry is SaleTransaction => Boolean(entry))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveSales(sales: SaleTransaction[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
}

export function addSale(input: SaleTransactionInput): SaleTransaction[] {
  const next = normalizeSale({
    ...input,
    id: createId(),
    quantity: input.quantity ?? 1,
    source: input.source ?? "manual",
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  if (!next) return loadSales();
  const sales = [next, ...loadSales()];
  saveSales(sales);
  return sales;
}

export function updateSale(
  id: string,
  patch: Partial<SaleTransactionInput>,
): SaleTransaction[] {
  const sales = loadSales().map((sale) => {
    if (sale.id !== id) return sale;
    return (
      normalizeSale({
        ...sale,
        ...patch,
        id: sale.id,
        createdAt: patch.createdAt ?? sale.createdAt,
        source: patch.source ?? sale.source,
      }) ?? sale
    );
  });
  saveSales(sales);
  return sales;
}

export function deleteSale(id: string): SaleTransaction[] {
  const sales = loadSales().filter((sale) => sale.id !== id);
  saveSales(sales);
  return sales;
}

export function resetSales(): SaleTransaction[] {
  saveSales([]);
  return [];
}

/** Start of current calendar year (local). */
export function getYearStart(date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function filterSalesSince(
  sales: SaleTransaction[],
  since: Date,
): SaleTransaction[] {
  const ts = since.getTime();
  return sales.filter((sale) => {
    const time = Date.parse(sale.createdAt);
    return Number.isFinite(time) && time >= ts;
  });
}

export function sumRevenue(sales: SaleTransaction[]): number {
  return sales.reduce((sum, sale) => sum + sale.salePrice * sale.quantity, 0);
}

export function sumProfit(sales: SaleTransaction[]): number {
  return sales.reduce(
    (sum, sale) => sum + (sale.salePrice - sale.purchasePrice) * sale.quantity,
    0,
  );
}

export function sumUnits(sales: SaleTransaction[]): number {
  return sales.reduce((sum, sale) => sum + sale.quantity, 0);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function buildRevenueSeries(
  sales: SaleTransaction[],
  period: "7d" | "30d" | "ytd" | "12m",
): Array<{ label: string; value: number }> {
  const now = new Date();
  const points: Array<{ key: string; label: string; start: Date }> = [];

  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i -= 1) {
      const day = startOfDay(new Date(now));
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      points.push({
        key,
        label:
          period === "7d"
            ? day.toLocaleDateString("de-DE", { weekday: "short" })
            : day.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
        start: day,
      });
    }
  } else {
    const months = period === "ytd" ? now.getMonth() + 1 : 12;
    for (let i = months - 1; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      points.push({
        key,
        label: monthDate.toLocaleDateString("de-DE", { month: "short" }),
        start: monthDate,
      });
    }
  }

  return points.map((point, index) => {
    const end =
      index < points.length - 1
        ? points[index + 1].start
        : new Date(point.start.getTime() + (period === "7d" || period === "30d"
            ? 24 * 60 * 60 * 1000
            : 32 * 24 * 60 * 60 * 1000));

    const value = sales.reduce((sum, sale) => {
      const time = Date.parse(sale.createdAt);
      if (!Number.isFinite(time)) return sum;
      if (time < point.start.getTime()) return sum;
      if (period === "7d" || period === "30d") {
        if (time >= end.getTime()) return sum;
      } else {
        const saleDate = new Date(time);
        if (
          saleDate.getFullYear() !== point.start.getFullYear() ||
          saleDate.getMonth() !== point.start.getMonth()
        ) {
          return sum;
        }
      }
      return sum + sale.salePrice * sale.quantity;
    }, 0);

    return { label: point.label, value: Math.round(value * 100) / 100 };
  });
}

export function getPeriodBounds(now = new Date()) {
  const startToday = startOfDay(now);
  const startWeek = startOfDay(now);
  const day = (startWeek.getDay() + 6) % 7; // Monday = 0
  startWeek.setDate(startWeek.getDate() - day);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = getYearStart(now);
  return { startToday, startWeek, startMonth, startYear };
}
