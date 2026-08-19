import type { StockStatus } from "@/types/admin";
import { getStockStatusLabel } from "@/types/admin";

const styles: Record<StockStatus, string> = {
  in_stock: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  low_stock: "bg-amber-50 text-amber-700 ring-amber-600/20",
  out_of_stock: "bg-red-50 text-red-700 ring-red-600/20",
};

export function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {getStockStatusLabel(status)}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-accent-soft text-accent-hover ring-accent/20",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    processing: "bg-amber-50 text-amber-700 ring-amber-600/20",
    shipped: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  };

  const labels: Record<string, string> = {
    new: "Neu",
    paid: "Bezahlt",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${map[status] ?? map.new}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "Bezahlt",
    pending: "Offen",
    failed: "Fehlgeschlagen",
    refunded: "Erstattet",
  };
  const colors: Record<string, string> = {
    paid: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    pending: "text-amber-700 bg-amber-50 ring-amber-600/20",
    failed: "text-red-700 bg-red-50 ring-red-600/20",
    refunded: "text-[#6e6e73] bg-[#f5f5f7] ring-[#d2d2d7]/60",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${colors[status] ?? colors.pending}`}>
      {map[status] ?? status}
    </span>
  );
}
