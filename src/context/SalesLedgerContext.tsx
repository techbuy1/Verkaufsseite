"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SaleTransaction, SaleTransactionInput } from "@/lib/salesTypes";
import {
  addSale,
  deleteSale,
  filterSalesSince,
  getPeriodBounds,
  getYearStart,
  loadSales,
  resetSales,
  sumProfit,
  sumRevenue,
  sumUnits,
  updateSale,
  buildRevenueSeries,
} from "@/lib/salesStore";

interface SalesLedgerContextValue {
  sales: SaleTransaction[];
  ready: boolean;
  ytdSales: SaleTransaction[];
  ytdRevenue: number;
  ytdProfit: number;
  ytdUnits: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  addSaleTransaction: (input: SaleTransactionInput) => void;
  updateSaleTransaction: (id: string, patch: Partial<SaleTransactionInput>) => void;
  removeSaleTransaction: (id: string) => void;
  resetAllSales: () => void;
  getSeries: (period: "7d" | "30d" | "ytd" | "12m") => Array<{ label: string; value: number }>;
}

const SalesLedgerContext = createContext<SalesLedgerContextValue | null>(null);

export function SalesLedgerProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSales(loadSales());
    setReady(true);
  }, []);

  const addSaleTransaction = useCallback((input: SaleTransactionInput) => {
    setSales(addSale(input));
  }, []);

  const updateSaleTransaction = useCallback(
    (id: string, patch: Partial<SaleTransactionInput>) => {
      setSales(updateSale(id, patch));
    },
    [],
  );

  const removeSaleTransaction = useCallback((id: string) => {
    setSales(deleteSale(id));
  }, []);

  const resetAllSales = useCallback(() => {
    setSales(resetSales());
  }, []);

  const metrics = useMemo(() => {
    const { startToday, startWeek, startMonth, startYear } = getPeriodBounds();
    const ytdSales = filterSalesSince(sales, startYear);
    return {
      ytdSales,
      ytdRevenue: sumRevenue(ytdSales),
      ytdProfit: sumProfit(ytdSales),
      ytdUnits: sumUnits(ytdSales),
      revenueToday: sumRevenue(filterSalesSince(sales, startToday)),
      revenueThisWeek: sumRevenue(filterSalesSince(sales, startWeek)),
      revenueThisMonth: sumRevenue(filterSalesSince(sales, startMonth)),
      yearLabel: getYearStart().getFullYear(),
    };
  }, [sales]);

  const getSeries = useCallback(
    (period: "7d" | "30d" | "ytd" | "12m") => buildRevenueSeries(sales, period),
    [sales],
  );

  const value = useMemo<SalesLedgerContextValue>(
    () => ({
      sales,
      ready,
      ytdSales: metrics.ytdSales,
      ytdRevenue: metrics.ytdRevenue,
      ytdProfit: metrics.ytdProfit,
      ytdUnits: metrics.ytdUnits,
      revenueToday: metrics.revenueToday,
      revenueThisWeek: metrics.revenueThisWeek,
      revenueThisMonth: metrics.revenueThisMonth,
      addSaleTransaction,
      updateSaleTransaction,
      removeSaleTransaction,
      resetAllSales,
      getSeries,
    }),
    [
      sales,
      ready,
      metrics,
      addSaleTransaction,
      updateSaleTransaction,
      removeSaleTransaction,
      resetAllSales,
      getSeries,
    ],
  );

  return (
    <SalesLedgerContext.Provider value={value}>{children}</SalesLedgerContext.Provider>
  );
}

export function useSalesLedger() {
  const ctx = useContext(SalesLedgerContext);
  if (!ctx) {
    throw new Error("useSalesLedger must be used within SalesLedgerProvider");
  }
  return ctx;
}
