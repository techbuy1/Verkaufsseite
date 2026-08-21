import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  intro?: string;
  updatedAt?: string;
  children: ReactNode;
}

/** Shared shell for all legal/info pages — same typography, spacing and card style as the rest of the site. */
export function LegalPageLayout({ eyebrow, title, intro, updatedAt, children }: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-[820px] px-5 py-16 md:px-8 md:py-20">
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">{eyebrow}</p>
      <h1 className="mb-4 text-[32px] font-bold tracking-tight text-text-primary md:text-[40px]">{title}</h1>
      {intro && (
        <p className="mb-4 max-w-[640px] text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
          {intro}
        </p>
      )}
      {updatedAt && <p className="mb-10 text-[13px] text-text-secondary/70">Stand: {updatedAt}</p>}
      <div className="legal-content space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-surface-card p-6 shadow-[var(--shadow-card)] md:p-8">
      <h2 className="mb-3 text-[19px] font-semibold text-text-primary">{title}</h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-text-secondary md:text-[15px]">{children}</div>
    </section>
  );
}
