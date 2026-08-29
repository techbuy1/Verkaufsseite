"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShop } from "@/context/ShopContext";
import {
  ANKAUF_URL,
  getMegaMenu,
  mainNavItems,
  type MegaMenuKey,
  type NavLinkItem,
} from "@/data/navigation";
import { ChevronRightIcon, CloseIcon } from "./Icons";

type MobilePanel =
  | { type: "root" }
  | { type: "mega"; key: MegaMenuKey }
  | { type: "section"; key: MegaMenuKey; title: string; links: NavLinkItem[] };

export function MobileNavigation() {
  const { isMobileMenuOpen, closeMobileMenu } = useShop();
  const [panel, setPanel] = useState<MobilePanel>({ type: "root" });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setPanel({ type: "root" });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  function handleNavigate() {
    closeMobileMenu();
    setPanel({ type: "root" });
  }

  function handleBack() {
    if (panel.type === "section") {
      setPanel({ type: "mega", key: panel.key });
      return;
    }

    setPanel({ type: "root" });
  }

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <nav
        className="absolute right-0 top-0 flex h-full w-[min(360px,88vw)] flex-col bg-white shadow-2xl animate-fade-in-up"
        aria-label="Mobile Navigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/[0.06] px-5">
          {panel.type === "root" ? (
            <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
              TechBuy
            </span>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="text-[15px] font-medium text-[#1d1d1f] transition-colors hover:text-black"
            >
              ← Zurück
            </button>
          )}

          <button
            type="button"
            onClick={closeMobileMenu}
            className="-mr-1 rounded-full p-2 text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            aria-label="Menü schließen"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {panel.type === "root" && (
            <RootPanel
              onMega={(key) => setPanel({ type: "mega", key })}
              onNavigate={handleNavigate}
            />
          )}

          {panel.type === "mega" && (
            <MegaPanel
              menuKey={panel.key}
              onSection={(title, links) =>
                setPanel({ type: "section", key: panel.key, title, links })
              }
              onNavigate={handleNavigate}
            />
          )}

          {panel.type === "section" && (
            <SectionPanel
              title={panel.title}
              links={panel.links}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      </nav>
    </div>
  );
}

function RootPanel({
  onMega,
  onNavigate,
}: {
  onMega: (key: MegaMenuKey) => void;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="px-5 pb-2 pt-4">
        <a
          href={ANKAUF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-feedback flex min-h-[48px] w-full items-center justify-center rounded-[12px] bg-accent px-5 text-[16px] font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
        >
          Ankauf
        </a>
      </div>

      <ul>
        {mainNavItems.map((item) => (
          <li key={item.label}>
            {item.megaMenu ? (
              <button
                type="button"
                onClick={() => onMega(item.megaMenu!)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[17px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                {item.label}
                <ChevronRightIcon className="h-4 w-4 text-[#6e6e73]" />
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex items-center px-5 py-3.5 text-[17px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function MegaPanel({
  menuKey,
  onSection,
  onNavigate,
}: {
  menuKey: MegaMenuKey;
  onSection: (title: string, links: NavLinkItem[]) => void;
  onNavigate: () => void;
}) {
  const config = getMegaMenu(menuKey);
  const [primary, ...rest] = config.columns;

  return (
    <div>
      <div className="border-b border-black/[0.06] px-5 py-4">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">
          {config.label}
        </h2>
      </div>

      {primary?.featured && primary.featured.length > 0 && (
        <ul className="border-b border-black/[0.06] py-2">
          {primary.featured.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="block px-5 py-3 text-[16px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ul className="py-2">
        {rest.map((column) =>
          column.title && column.links && column.links.length > 0 ? (
            <li key={column.title}>
              <button
                type="button"
                onClick={() => onSection(column.title!, column.links!)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[17px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                {column.title}
                <ChevronRightIcon className="h-4 w-4 text-[#6e6e73]" />
              </button>
            </li>
          ) : null,
        )}

        {primary?.links?.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="block px-5 py-3 text-[15px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {primary?.smallLinks && primary.smallLinks.length > 0 && (
        <ul className="border-t border-black/[0.06] py-2">
          {primary.smallLinks.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="block px-5 py-3 text-[14px] text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionPanel({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: NavLinkItem[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <div className="border-b border-black/[0.06] px-5 py-4">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
          {title}
        </h2>
      </div>
      <ul className="py-2">
        {links.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="block px-5 py-3.5 text-[16px] text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
