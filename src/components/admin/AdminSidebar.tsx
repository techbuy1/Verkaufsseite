"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin/navigation";
import { AdminIcon } from "./AdminIcons";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar shrink-0 ${open ? "" : "is-closed"}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            className="text-[17px] font-semibold tracking-tight text-white"
            onClick={onClose}
          >
            TechBuy Admin
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Menü schließen"
          >
            <AdminIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`admin-nav-link ${active ? "is-active" : ""}`}
                  >
                    <AdminIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link href="/" className="admin-nav-link" onClick={onClose}>
            Zum Shop
          </Link>
          <button
            type="button"
            className="admin-nav-link w-full"
            title="Auth wird später serverseitig implementiert"
          >
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
