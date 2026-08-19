"use client";

import { useState, type ReactNode } from "react";
import { AdminInventoryProvider } from "@/context/AdminInventoryContext";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminInventoryProvider>
      <div className="admin-shell flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminInventoryProvider>
  );
}
