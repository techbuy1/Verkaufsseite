import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login – TechBuy",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F3] px-6 py-12">
      <div className="w-full max-w-[440px] rounded-[20px] border border-border bg-white p-7 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            TechBuy Admin
          </p>
          <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-text-primary">
            Anmelden
          </h1>
          <p className="mt-2 text-[14px] text-text-secondary">
            Bitte melden Sie sich an, um den Admin-Bereich zu öffnen.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-soft" />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
