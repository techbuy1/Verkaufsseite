"use client";

import Image from "next/image";
import Link from "next/link";
import { DEMO_PRODUCTS, getCategoryName } from "@/data/admin/demoData";
import { formatCurrency, getStockStatus } from "@/types/admin";
import { AdminIcon } from "./AdminIcons";
import { StatusBadge } from "./StatusBadge";

export function ProductTable() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Produkte</h1>
          <p className="mt-1 text-[14px] text-[#6e6e73]">Demo-Produktkatalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <AdminIcon name="plus" className="h-4 w-4" />
          Neues Produkt
        </Link>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#d2d2d7]/40 bg-[#f5f5f7]/50 text-[12px] uppercase tracking-wider text-[#6e6e73]">
                <th className="px-4 py-3 font-medium">Bild</th>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Kategorie</th>
                <th className="px-4 py-3 font-medium">Preis</th>
                <th className="px-4 py-3 font-medium">Bestand</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Veröffentlicht</th>
                <th className="px-4 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PRODUCTS.map((product) => {
                const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
                const minStock = Math.max(...product.variants.map((v) => v.minStock));
                const status = getStockStatus(totalStock, minStock);
                const price = product.variants[0]?.salePrice ?? 0;

                return (
                  <tr key={product.id} className="border-b border-[#d2d2d7]/30 last:border-0 hover:bg-[#f5f5f7]/40">
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#f5f5f7]">
                        <Image src={product.image} alt="" fill className="object-contain p-1" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-[12px] text-[#6e6e73]">{product.brand}</p>
                    </td>
                    <td className="px-4 py-3">{getCategoryName(product.categoryId)}</td>
                    <td className="px-4 py-3">{formatCurrency(price)}</td>
                    <td className="px-4 py-3 font-semibold">{totalStock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${
                          product.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#f5f5f7] text-[#6e6e73]"
                        }`}
                      >
                        {product.published ? "Ja" : "Nein"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-[13px]">
                        <button className="text-accent hover:underline">Bearbeiten</button>
                        <button className="text-[#6e6e73] hover:underline">Duplizieren</button>
                        <button className="text-[#6e6e73] hover:underline">Archivieren</button>
                        <button className="text-red-600 hover:underline">Löschen</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
