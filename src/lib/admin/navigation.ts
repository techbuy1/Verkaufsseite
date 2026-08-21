export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "overview" },
  { label: "Produkte", href: "/admin/products", icon: "products" },
  { label: "Verkäufe", href: "/admin/sales", icon: "orders" },
  { label: "Massenbearbeitung", href: "/admin/bulk", icon: "inventory" },
  { label: "Kategorien", href: "/admin/categories", icon: "categories" },
  { label: "Top Deal der Woche", href: "/admin/top-deal", icon: "topdeal" },
  { label: "Bestellungen", href: "/admin/orders", icon: "orders" },
  { label: "Kunden", href: "/admin/customers", icon: "customers" },
  { label: "Einstellungen", href: "/admin/settings", icon: "settings" },
] as const;

export type AdminNavIcon = (typeof ADMIN_NAV)[number]["icon"];
