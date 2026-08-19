/** @file Demo-only admin types. Replace with DB models when PostgreSQL/Supabase is connected. */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type OrderStatus =
  | "new"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type ShippingStatus = "pending" | "processing" | "shipped" | "delivered";

export type InventoryMovementReason =
  | "goods_receipt"
  | "sale"
  | "return"
  | "inventory_correction"
  | "damaged"
  | "other";

export type StockAdjustAction = "add" | "remove" | "set";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  label: string;
  storage?: string;
  color?: string;
  sku: string;
  ean?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  trackInventory: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  image: string;
  comparePrice?: number;
  taxRate: number;
  published: boolean;
  variants: ProductVariant[];
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  categoryId: string;
  image: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  action: StockAdjustAction;
  quantity: number;
  reason: InventoryMovementReason;
  note?: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantLabel?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  status: OrderStatus;
  shippingAddress: string;
}

export interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
}

export interface RevenueDataPoint {
  label: string;
  value: number;
}

export interface LowStockAlert {
  id: string;
  productName: string;
  variantLabel: string;
  stock: number;
  minStock: number;
}

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= minStock) return "low_stock";
  return "in_stock";
}

export function getStockStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    in_stock: "Auf Lager",
    low_stock: "Wenig Bestand",
    out_of_stock: "Ausverkauft",
  };
  return labels[status];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
