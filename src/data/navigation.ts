export interface NavLinkItem {
  label: string;
  href: string;
}

export interface MegaMenuColumn {
  eyebrow?: string;
  title?: string;
  featured?: NavLinkItem[];
  links?: NavLinkItem[];
  smallLinks?: NavLinkItem[];
}

export type MegaMenuKey =
  | "smartphones"
  | "tablets"
  | "macbooks"
  | "laptops"
  | "audio"
  | "zubehoer";

export interface MegaMenuConfig {
  key: MegaMenuKey;
  label: string;
  href: string;
  columns: MegaMenuColumn[];
}

export interface MainNavItem {
  label: string;
  href: string;
  megaMenu?: MegaMenuKey;
}

const product = (slug: string) => `/products/${slug}`;

export const megaMenus: Record<MegaMenuKey, MegaMenuConfig> = {
  smartphones: {
    key: "smartphones",
    label: "Smartphones",
    href: "/smartphones",
    columns: [
      {
        eyebrow: "Smartphones entdecken",
        featured: [
          { label: "Alle Smartphones", href: "/smartphones" },
          { label: "iPhone 17 Pro", href: product("iphone-17-pro") },
          { label: "iPhone 17", href: product("iphone-17") },
          { label: "Galaxy S26 Ultra", href: product("galaxy-s26-ultra") },
          { label: "Google Pixel", href: product("pixel-8-pro") },
          { label: "Xiaomi", href: "/smartphones?brand=xiaomi" },
        ],
        smallLinks: [
          { label: "Smartphones vergleichen", href: "/smartphones#vergleichen" },
          { label: "Neuheiten", href: "/smartphones#neuheiten" },
          { label: "Angebote", href: "/#angebote" },
        ],
      },
      {
        title: "Apple",
        links: [
          { label: "iPhone 17 Pro", href: product("iphone-17-pro") },
          { label: "iPhone 17", href: product("iphone-17") },
          { label: "iPhone 16", href: "/smartphones?model=iphone-16" },
          { label: "iPhone Zubehör", href: "/zubehoer?category=iphone" },
        ],
      },
      {
        title: "Samsung",
        links: [
          { label: "Galaxy S26 Ultra", href: product("galaxy-s26-ultra") },
          { label: "Galaxy S-Serie", href: "/smartphones?series=galaxy-s" },
          { label: "Galaxy Z-Serie", href: "/smartphones?series=galaxy-z" },
          { label: "Galaxy A-Serie", href: "/smartphones?series=galaxy-a" },
        ],
      },
      {
        title: "Mehr entdecken",
        links: [
          { label: "Google Pixel", href: product("pixel-8-pro") },
          { label: "Xiaomi", href: "/smartphones?brand=xiaomi" },
          { label: "Smartphone Zubehör", href: "/zubehoer?category=smartphone" },
          { label: "Schutzhüllen", href: "/zubehoer?category=huellen" },
          { label: "Ladegeräte", href: "/zubehoer?category=ladegeraete" },
        ],
      },
    ],
  },
  tablets: {
    key: "tablets",
    label: "Tablets",
    href: "/tablets",
    columns: [
      {
        eyebrow: "Tablets entdecken",
        featured: [{ label: "Alle Tablets", href: "/tablets" }],
      },
      {
        title: "Apple",
        links: [
          { label: "iPad Pro", href: "/tablets?model=ipad-pro" },
          { label: "iPad Air", href: product("ipad-air") },
          { label: "iPad", href: "/tablets?model=ipad" },
          { label: "iPad mini", href: "/tablets?model=ipad-mini" },
        ],
      },
      {
        title: "Samsung",
        links: [
          { label: "Galaxy Tab S", href: "/tablets?series=galaxy-tab-s" },
          { label: "Galaxy Tab A", href: "/tablets?series=galaxy-tab-a" },
        ],
      },
      {
        title: "Weitere",
        links: [
          { label: "Android Tablets", href: "/tablets?platform=android" },
          { label: "Tablet Zubehör", href: "/zubehoer?category=tablet" },
          { label: "Tastaturen", href: "/zubehoer?category=tastaturen" },
          { label: "Stifte", href: "/zubehoer?category=stifte" },
        ],
      },
    ],
  },
  macbooks: {
    key: "macbooks",
    label: "MacBooks",
    href: "/macbooks",
    columns: [
      {
        eyebrow: "MacBooks entdecken",
        featured: [
          { label: "Alle MacBooks", href: "/macbooks" },
          { label: "MacBook Air", href: product("macbook-air") },
          { label: "MacBook Pro", href: "/macbooks?model=macbook-pro" },
        ],
      },
      {
        title: "Zubehör",
        links: [
          { label: "Mac Zubehör", href: "/zubehoer?category=mac" },
          { label: "Displays", href: "/zubehoer?category=displays" },
          { label: "Tastaturen", href: "/zubehoer?category=tastaturen" },
          { label: "Mäuse", href: "/zubehoer?category=maeuse" },
          { label: "Hubs & Adapter", href: "/zubehoer?category=hubs" },
        ],
      },
    ],
  },
  laptops: {
    key: "laptops",
    label: "Laptops",
    href: "/laptops",
    columns: [
      {
        eyebrow: "Laptops entdecken",
        featured: [
          { label: "Alle Laptops", href: "/laptops" },
          { label: "Gaming Laptops", href: "/laptops?type=gaming" },
          { label: "Business Laptops", href: "/laptops?type=business" },
          { label: "Ultrabooks", href: "/laptops?type=ultrabook" },
          { label: "Windows Laptops", href: "/laptops?platform=windows" },
        ],
      },
      {
        title: "Marken",
        links: [
          { label: "Lenovo", href: "/laptops?brand=lenovo" },
          { label: "HP", href: "/laptops?brand=hp" },
          { label: "ASUS", href: "/laptops?brand=asus" },
          { label: "Acer", href: "/laptops?brand=acer" },
          { label: "Dell", href: "/laptops?brand=dell" },
        ],
      },
      {
        title: "Zubehör",
        links: [
          { label: "Laptop Zubehör", href: "/zubehoer?category=laptop" },
          { label: "Monitore", href: "/zubehoer?category=monitore" },
          { label: "Docking Stations", href: "/zubehoer?category=docking" },
        ],
      },
    ],
  },
  audio: {
    key: "audio",
    label: "Audio",
    href: "/audio",
    columns: [
      {
        eyebrow: "Audio entdecken",
        featured: [
          { label: "Alle Audio-Produkte", href: "/audio" },
          { label: "AirPods", href: product("airpods-pro") },
          { label: "Kopfhörer", href: "/audio?type=kopfhoerer" },
          { label: "In-Ear", href: "/audio?type=in-ear" },
          { label: "Over-Ear", href: "/audio?type=over-ear" },
          { label: "Bluetooth Lautsprecher", href: "/audio?type=lautsprecher" },
        ],
      },
      {
        title: "Marken",
        links: [
          { label: "Apple", href: "/audio?brand=apple" },
          { label: "Sony", href: "/audio?brand=sony" },
          { label: "Bose", href: "/audio?brand=bose" },
          { label: "JBL", href: "/audio?brand=jbl" },
          { label: "Samsung", href: "/audio?brand=samsung" },
        ],
      },
    ],
  },
  zubehoer: {
    key: "zubehoer",
    label: "Zubehör",
    // "/zubehoer" existiert als Route nicht (404) — es gibt keine eigene
    // Zubehör-Seite, nur den Store-Filter. Andere Links in dieser Spalte
    // (z. B. "/zubehoer?category=huellen") zeigen auf dieselbe fehlende
    // Route und führen ebenfalls ins Leere — das ist ein vorbestehendes,
    // umfassenderes Problem außerhalb dieses Header-Umbaus.
    href: "/store?category=zubehoer",
    columns: [
      {
        eyebrow: "Zubehör entdecken",
        featured: [{ label: "Alle Zubehörprodukte", href: "/store?category=zubehoer" }],
        links: [
          { label: "Smartphone Hüllen", href: "/zubehoer?category=huellen" },
          { label: "Displayschutz", href: "/zubehoer?category=displayschutz" },
          { label: "Ladegeräte", href: "/zubehoer?category=ladegeraete" },
          { label: "Kabel", href: "/zubehoer?category=kabel" },
          { label: "Powerbanks", href: "/zubehoer?category=powerbanks" },
          { label: "Adapter", href: "/zubehoer?category=adapter" },
          { label: "Halterungen", href: "/zubehoer?category=halterungen" },
          { label: "Kopfhörer", href: "/zubehoer?category=kopfhoerer" },
          { label: "Smartwatch Armbänder", href: "/zubehoer?category=armbaender" },
        ],
      },
    ],
  },
};

// Tablets, Laptops und Audio bewusst nicht mehr in der Hauptnavigation —
// die Seiten/Mega-Menüs bleiben bestehen und sind weiterhin über /store
// bzw. ihre Routen erreichbar, nur nicht mehr oben verlinkt.
export const mainNavItems: MainNavItem[] = [
  { label: "Store", href: "/store" },
  { label: "Smartphones", href: "/smartphones", megaMenu: "smartphones" },
  { label: "MacBooks", href: "/macbooks", megaMenu: "macbooks" },
  { label: "Zubehör", href: "/store?category=zubehoer", megaMenu: "zubehoer" },
  // War zuvor "/#angebote" — dieser Anker existiert auf der Startseite nicht
  // und führte ins Leere. /store?sort=deals ist der echte, bereits
  // implementierte Angebots-Filter (siehe lib/storeCatalog.ts VALID_SORT).
  { label: "Angebote", href: "/store?sort=deals" },
];

/** Bestehende externe Ankauf-Plattform — siehe Footer.tsx / techbuyServices.ts. */
export const ANKAUF_URL = "https://www.techbuy-ankauf.de/";

export function getMegaMenu(key: MegaMenuKey): MegaMenuConfig {
  return megaMenus[key];
}

/** @deprecated Use mainNavItems from navigation.ts */
export const navLinks = mainNavItems.map(({ label, href }) => ({ label, href }));
