"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminInventory } from "@/context/AdminInventoryContext";
import { useProductStore } from "@/context/ProductStoreContext";
import { DEMO_DASHBOARD_STATS } from "@/data/admin/demoData";
import { getAvailabilityStats } from "@/lib/productAvailability";
import { formatCurrency } from "@/types/admin";
import { RevenueChart } from "./RevenueChart";
import { StatCard } from "./StatCard";

export function DashboardContent() {
  const { lowStockAlerts } = useAdminInventory();
  const { products } = useProductStore();

  const stockStats = useMemo(() => getAvailabilityStats(products), [products]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div>
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">
          Willkommen zurück. Hier hast du deinen Shop im Überblick.
        </p>
        <p className="mt-2 text-[12px] text-amber-700">Demo-Daten — nicht persistent gespeichert</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Gesamtumsatz" value={formatCurrency(DEMO_DASHBOARD_STATS.totalRevenue)} />
        <StatCard label="Bestellungen" value={String(DEMO_DASHBOARD_STATS.ordersCount)} />
        <StatCard label="Produkte verfügbar" value={String(stockStats.availableCount)} />
        <StatCard label="Niedriger Bestand" value={String(stockStats.lowStockCount)} accent="warning" />
        <StatCard label="Ausverkauft" value={String(stockStats.outOfStockCount)} accent="danger" />
        <StatCard label="Gesamter Bestand" value={`${stockStats.totalStockUnits} Stück`} />
      </div>

      <RevenueChart />

      <div className="rounded-[18px] border border-amber-200/60 bg-amber-50/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-amber-900">
              ⚠ {lowStockAlerts.length} Produkte müssen nachbestellt werden
            </p>
            <ul className="mt-4 space-y-3">
              {lowStockAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-4 text-[14px]">
                  <span className="font-medium text-[#1d1d1f]">
                    {alert.productName}
                    {alert.variantLabel !== "Standard" && ` · ${alert.variantLabel}`}
                  </span>
                  <span className="text-[#6e6e73]">Noch {alert.stock} Stück</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/admin/inventory"
            className="btn-techbuy-primary shrink-0 px-5 py-2.5 text-[14px]"
          >
            Bestand ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}
