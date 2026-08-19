"use client";

import type { MegaMenuKey } from "@/data/navigation";
import { getMegaMenu } from "@/data/navigation";
import { MegaMenuColumnView } from "./MegaMenuColumn";

interface MegaMenuProps {
  activeKey: MegaMenuKey | null;
  menuId: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate?: () => void;
}

export function MegaMenu({
  activeKey,
  menuId,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: MegaMenuProps) {
  const isOpen = activeKey !== null;
  const config = activeKey ? getMegaMenu(activeKey) : null;

  return (
    <div
      id={menuId}
      role="region"
      aria-label={config ? `${config.label} Navigation` : undefined}
      aria-hidden={!isOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`hidden border-t border-black/[0.06] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out lg:block ${
        isOpen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1.5 opacity-0"
      }`}
    >
      {config && (
        <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-14 lg:px-12">
          <div
            className={`grid gap-10 ${
              config.columns.length >= 4
                ? "md:grid-cols-2 xl:grid-cols-4"
                : config.columns.length === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2"
            }`}
          >
            {config.columns.map((column, index) => (
              <MegaMenuColumnView
                key={`${config.key}-${column.title ?? column.eyebrow ?? index}`}
                column={column}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
