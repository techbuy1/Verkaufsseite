"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { mainNavItems, type MegaMenuKey } from "@/data/navigation";
import {
  AccountIcon,
  BagIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
} from "./Icons";
import { CartDrawer } from "./CartDrawer";
import { MegaMenu } from "./MegaMenu";
import { MobileNavigation } from "./MobileNavigation";
import { SearchBar } from "./SearchBar";
import { TechBuyLogo } from "./TechBuyLogo";

const MEGA_MENU_ID = "techbuy-mega-menu";
const CLOSE_DELAY_MS = 200;

function IconButton({
  children,
  label,
  href,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}) {
  const className =
    "relative flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-hover";
  const badgeEl = badge !== undefined && badge > 0 && (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
      {badge}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
        {badgeEl}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {children}
      {badgeEl}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const { cartCount, wishlist, openMobileMenu, openCart } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMegaMenu(null);
    }, CLOSE_DELAY_MS);
  }, [cancelClose]);

  const openMegaMenu = useCallback(
    (key: MegaMenuKey) => {
      cancelClose();
      setActiveMegaMenu(key);
    },
    [cancelClose],
  );

  const toggleMegaMenu = useCallback(
    (key: MegaMenuKey) => {
      cancelClose();
      setActiveMegaMenu((current) => (current === key ? null : key));
    },
    [cancelClose],
  );

  const closeMegaMenu = useCallback(() => {
    cancelClose();
    setActiveMegaMenu(null);
  }, [cancelClose]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!activeMegaMenu) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMegaMenu();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeMegaMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [activeMegaMenu, closeMegaMenu]);

  useEffect(() => {
    return () => cancelClose();
  }, [cancelClose]);

  return (
    <>
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <header
          className={`border-b border-border transition-all duration-300 ${
            scrolled
              ? "border-border bg-surface-card/95 shadow-[0_1px_0_rgba(23,23,23,0.04)] backdrop-blur-md"
              : "border-border bg-surface-card"
          }`}
        >
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
            <div className="flex h-[68px] items-center gap-4 lg:h-[72px] lg:gap-6">
              <TechBuyLogo />

              {/*
               * `justify-center` here was the actual bug behind "Store"
               * looking cut off: when this row's content is wider than the
               * available space — true even at wide desktop widths once the
               * search bar and icon buttons are accounted for — centering it
               * inside a scrollable container pushes part of the *first*
               * item further left than scrollLeft 0 can ever reach:
               * permanently hidden, not just visually tight. `justify-start`
               * keeps every item reachable by normal (only positive)
               * scrolling, with nothing clipped, at any width.
               */}
              <nav
                className="scrollbar-hide hidden min-w-0 flex-1 items-center justify-start gap-5 overflow-x-auto pl-1 lg:flex xl:gap-6"
                aria-label="Hauptnavigation"
              >
                {mainNavItems.map((item) =>
                  item.megaMenu ? (
                    <div
                      key={item.label}
                      className="relative shrink-0"
                      onMouseEnter={() => openMegaMenu(item.megaMenu!)}
                      onMouseLeave={scheduleClose}
                    >
                      <button
                        type="button"
                        className={`shop-nav-link xl:text-[14px] ${
                          activeMegaMenu === item.megaMenu ? "font-medium" : ""
                        }`}
                        aria-expanded={activeMegaMenu === item.megaMenu}
                        aria-haspopup="true"
                        aria-controls={MEGA_MENU_ID}
                        onClick={() => toggleMegaMenu(item.megaMenu!)}
                      >
                        {item.label}
                      </button>
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={
                        item.href === "/store" && pathname.startsWith("/store")
                          ? "page"
                          : undefined
                      }
                      className={`shop-nav-link shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 xl:text-[14px] ${
                        item.href === "/store" && pathname.startsWith("/store")
                          ? "shop-nav-link-active"
                          : ""
                      }`}
                      onMouseEnter={closeMegaMenu}
                    >
                      {item.href === "/store" ? (
                        <span className="inline-flex items-center gap-1">
                          {item.label}
                          <span className="motion-safe:animate-[header-flame-flicker_1.6s_ease-in-out_infinite]" aria-hidden="true">
                            🔥
                          </span>
                        </span>
                      ) : (
                        item.label
                      )}
                    </Link>
                  ),
                )}
              </nav>

              <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
                <SearchBar className="w-[220px] xl:w-[300px]" variant="header" />
                <IconButton label="Konto">
                  <AccountIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Wunschliste" href="/wishlist" badge={wishlist.size}>
                  <HeartIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Warenkorb" badge={cartCount} onClick={openCart}>
                  <BagIcon className="h-[18px] w-[18px]" />
                </IconButton>
              </div>

              <div className="ml-auto flex items-center gap-1 lg:hidden">
                <IconButton
                  label={mobileSearchOpen ? "Suche schließen" : "Suche öffnen"}
                  onClick={() => setMobileSearchOpen((value) => !value)}
                >
                  <SearchIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Warenkorb" badge={cartCount} onClick={openCart}>
                  <BagIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Menü öffnen" onClick={openMobileMenu}>
                  <MenuIcon className="h-[18px] w-[18px]" />
                </IconButton>
              </div>
            </div>

            {mobileSearchOpen && (
              <div className="border-t border-black/[0.06] pb-4 pt-3 lg:hidden">
                <SearchBar
                  autoFocus
                  variant="header"
                  onClose={() => setMobileSearchOpen(false)}
                />
              </div>
            )}
          </div>

          <MegaMenu
            activeKey={activeMegaMenu}
            menuId={MEGA_MENU_ID}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onNavigate={closeMegaMenu}
          />
        </header>
      </div>

      {activeMegaMenu && (
        <button
          type="button"
          aria-label="Navigation schließen"
          className="fixed inset-0 top-[72px] z-40 hidden bg-black/15 lg:block"
          onClick={closeMegaMenu}
        />
      )}

      <MobileNavigation />
      <CartDrawer />
    </>
  );
}
