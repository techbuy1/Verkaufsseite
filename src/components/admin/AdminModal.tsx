"use client";

import { useEffect, type ReactNode } from "react";
import { AdminIcon } from "./AdminIcons";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export function AdminModal({ open, onClose, title, children, wide }: AdminModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[20px] bg-white shadow-2xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#d2d2d7]/40 px-6 py-4">
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6e6e73] hover:bg-[#f5f5f7]"
            aria-label="Schließen"
          >
            <AdminIcon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
