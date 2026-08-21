"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProductStore } from "@/context/ProductStoreContext";
import { useSalesLedger } from "@/context/SalesLedgerContext";
import {
  getAvailabilityStats,
  isLowStockProduct,
} from "@/lib/productAvailability";
import { formatCurrency } from "@/types/admin";
import { RevenueChart } from "./RevenueChart";
import { StatCard } from "./StatCard";

export function DashboardContent() {
  const { products } = useProductStore();
  const {
    ytdRevenue,
    ytdProfit,
    ytdUnits,
    ytdSales,
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    resetAllSales,
    getSeries,
  } = useSalesLedger();

  const stockStats = useMemo(() => getAvailabilityStats(products), [products]);
  const year = new Date().getFullYear();

  const lowStockProducts = useMemo(
    () => products.filter((product) => isLowStockProduct(product)).slice(0, 5),
    [products],
  );

  function handleReset() {
    const ok = window.confirm(
      `Alle Verkaufsdaten zurücksetzen?\n\nUmsatz, Rohertrag und die Transaktionsliste werden gelöscht (ab ${year} neu aufbauen).`,
    );
    if (!ok) return;
    resetAllSales();
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Umsatz seit 1. Januar {year} — basierend auf deinen erfassten Verkäufen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/sales" className="btn-techbuy-primary px-4 py-2.5 text-[13px]">
            Verkauf erfassen
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:text-text-primary"
          >
            Daten zurücksetzen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={`Umsatz ${year}`} value={formatCurrency(ytdRevenue)} />
        <StatCard label={`Rohertrag ${year}`} value={formatCurrency(ytdProfit)} />
        <StatCard label="Verkäufe (Stück)" value={String(ytdUnits)} />
        <StatCard
          label="Im Shop sichtbar"
          value={String(stockStats.availableCount + stockStats.presaleCount)}
        />
        <StatCard
          label="Niedriger Bestand"
          value={String(stockStats.lowStockCount)}
          accent="warning"
        />
        <StatCard
          label="Ohne Bestand"
          value={String(stockStats.outOfStockCount)}
          accent="danger"
        />
      </div>

      <RevenueChart
        getSeries={getSeries}
        revenueToday={revenueToday}
        revenueThisWeek={revenueThisWeek}
        revenueThisMonth={revenueThisMonth}
        ytdRevenue={ytdRevenue}
        year={year}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[18px] border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold">Letzte Verkäufe</h2>
            <Link href="/admin/sales" className="text-[13px] text-accent hover:underline">
              Alle anzeigen
            </Link>
          </div>
          {ytdSales.length === 0 ? (
            <p className="text-[14px] text-text-secondary">
              Noch keine Verkäufe in {year}. Erfasse den ersten unter „Verkäufe“.
            </p>
          ) : (
            <ul className="space-y-3">
              {ytdSales.slice(0, 6).map((sale) => (
                <li
                  key={sale.id}
                  className="flex items-start justify-between gap-3 text-[14px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{sale.productName}</p>
                    <p className="text-[12px] text-text-secondary">
                      {new Date(sale.createdAt).toLocaleDateString("de-DE")}
                      {sale.imei ? ` · IMEI ${sale.imei}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {formatCurrency(sale.salePrice * sale.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[18px] border border-amber-200/60 bg-amber-50/50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-amber-900">
                {lowStockProducts.length > 0
                  ? `⚠ ${stockStats.lowStockCount} Produkte mit niedrigem Bestand`
                  : "Bestand aktuell unkritisch"}
              </p>
              <ul className="mt-4 space-y-3">
                {lowStockProducts.length === 0 ? (
                  <li className="text-[14px] text-amber-900/80">
                    Produkte ohne Bestand erscheinen nicht im Shop (außer Vorverkauf).
                  </li>
                ) : (
                  lowStockProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-4 text-[14px]"
                    >
                      <span className="font-medium text-[#1d1d1f]">{product.name}</span>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-accent hover:underline"
                      >
                        Bearbeiten
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <Link
              href="/admin/products"
              className="btn-techbuy-primary shrink-0 px-5 py-2.5 text-[14px]"
            >
              Produkte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
