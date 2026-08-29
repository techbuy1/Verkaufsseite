"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminInventoryProvider } from "@/context/AdminInventoryContext";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminInventoryProvider>
      <div className="admin-shell">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminInventoryProvider>
  );
}
