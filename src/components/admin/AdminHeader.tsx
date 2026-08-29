"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminIcon } from "./AdminIcons";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setLoggingOut(false);
    }
  }

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

      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium text-accent sm:inline-flex">
          Admin
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-[13px] font-semibold text-white">
          TB
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-text-primary disabled:opacity-60"
        >
          {loggingOut ? "…" : "Abmelden"}
        </button>
      </div>
    </header>
  );
}
