"use client";

import { AdminIcon } from "./AdminIcons";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-text-primary hover:bg-background-secondary lg:hidden"
        aria-label="Menü öffnen"
      >
        <AdminIcon name="menu" className="h-5 w-5" />
      </button>

      <div className="relative max-w-xl flex-1">
        <AdminIcon
          name="search"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="search"
          placeholder="Produkte, Bestellungen oder Kunden suchen..."
          className="admin-header-search"
          aria-label="Globale Admin-Suche"
        />
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-medium"
          style={{ background: "var(--color-accent-soft, #eafaf1)", color: "var(--color-accent-hover, #0fa858)" }}
        >
          Admin
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[13px] font-semibold text-white">
          TB
        </div>
      </div>
    </header>
  );
}
