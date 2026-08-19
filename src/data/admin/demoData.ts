import { heroImagePath } from "@/data/heroImageAssets";
import type {
  AdminCategory,
  Customer,
  DashboardStats,
  InventoryItem,
  LowStockAlert,
  Order,
  Product,
  RevenueDataPoint,
} from "@/types/admin";

export const DEMO_CATEGORIES: AdminCategory[] = [
  { id: "cat-smartphones", name: "Smartphones", slug: "smartphones" },
  { id: "cat-tablets", name: "Tablets", slug: "tablets" },
  { id: "cat-smartwatches", name: "Smartwatches", slug: "smartwatches" },
  { id: "cat-laptops", name: "Laptops", slug: "laptops" },
  { id: "cat-accessories", name: "Zubehör", slug: "accessories" },
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "prod-iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "Apple",
    categoryId: "cat-smartphones",
    description: "Premium-Smartphone mit starker Performance und Pro-Kamerasystem.",
    image: heroImagePath("iphone17ProLineup"),
    comparePrice: 1199,
    taxRate: 19,
    published: true,
    variants: [
      {
        id: "var-ip17p-256-blk",
        productId: "prod-iphone-17-pro",
        label: "256 GB · Schwarz",
        storage: "256 GB",
        color: "Schwarz",
        sku: "IP17P-256-BLK",
        ean: "0194253478921",
        purchasePrice: 850,
        salePrice: 1099,
        stock: 14,
        minStock: 5,
        trackInventory: true,
      },
      {
        id: "var-ip17p-512-org",
        productId: "prod-iphone-17-pro",
        label: "512 GB · Orange",
        storage: "512 GB",
        color: "Orange",
        sku: "IP17P-512-ORG",
        purchasePrice: 980,
        salePrice: 1249,
        stock: 2,
        minStock: 5,
        trackInventory: true,
      },
    ],
  },
  {
    id: "prod-galaxy-s26-ultra",
    name: "Galaxy S26 Ultra",
    brand: "Samsung",
    categoryId: "cat-smartphones",
    description: "Ultra-Performance mit S Pen und Pro-Kamera.",
    image: heroImagePath("galaxyS26UltraLineup"),
    taxRate: 19,
    published: true,
    variants: [
      {
        id: "var-s26u-512-blk",
        productId: "prod-galaxy-s26-ultra",
        label: "512 GB · Schwarz",
        storage: "512 GB",
        color: "Schwarz",
        sku: "S26U-512-BLK",
        purchasePrice: 900,
        salePrice: 1249,
        stock: 4,
        minStock: 5,
        trackInventory: true,
      },
    ],
  },
  {
    id: "prod-ipad-air",
    name: "iPad Air",
    brand: "Apple",
    categoryId: "cat-tablets",
    description: "Leistungsstarkes Tablet für Arbeit und Kreativität.",
    image: "/images/categories/iPad.jpg",
    taxRate: 19,
    published: true,
    variants: [
      {
        id: "var-ipad-256",
        productId: "prod-ipad-air",
        label: "256 GB · Space Gray",
        storage: "256 GB",
        color: "Space Gray",
        sku: "IPAD-AIR-256",
        purchasePrice: 520,
        salePrice: 649,
        stock: 18,
        minStock: 4,
        trackInventory: true,
      },
    ],
  },
  {
    id: "prod-airpods-pro",
    name: "AirPods Pro",
    brand: "Apple",
    categoryId: "cat-accessories",
    description: "Premium In-Ear Kopfhörer mit ANC.",
    image: "/images/categories/images-3.jpg",
    taxRate: 19,
    published: true,
    variants: [
      {
        id: "var-airpods-pro",
        productId: "prod-airpods-pro",
        label: "Standard",
        sku: "AIRPODS-PRO-2",
        purchasePrice: 165,
        salePrice: 249,
        stock: 1,
        minStock: 3,
        trackInventory: true,
      },
    ],
  },
  {
    id: "prod-macbook-air",
    name: "MacBook Air",
    brand: "Apple",
    categoryId: "cat-laptops",
    description: "Leicht, schnell und alltagstauglich.",
    image: "/images/categories/Macbook.jpg",
    taxRate: 19,
    published: true,
    variants: [
      {
        id: "var-mba-m3",
        productId: "prod-macbook-air",
        label: "M3 · 16 GB · 512 GB",
        storage: "512 GB",
        sku: "MBA-M3-512",
        purchasePrice: 980,
        salePrice: 1199,
        stock: 0,
        minStock: 2,
        trackInventory: true,
      },
    ],
  },
  {
    id: "prod-watch-ultra",
    name: "Apple Watch Ultra",
    brand: "Apple",
    categoryId: "cat-smartwatches",
    description: "Robuste Smartwatch für aktive Nutzer.",
    image: "/images/categories/images-4.jpg",
    taxRate: 19,
    published: false,
    variants: [
      {
        id: "var-watch-ultra",
        productId: "prod-watch-ultra",
        label: "Titanium · Black",
        color: "Schwarz",
        sku: "AWU-BLK-49",
        purchasePrice: 620,
        salePrice: 799,
        stock: 7,
        minStock: 3,
        trackInventory: true,
      },
    ],
  },
];

export function productsToInventoryItems(products: Product[]): InventoryItem[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: variant.label,
      sku: variant.sku,
      categoryId: product.categoryId,
      image: product.image,
      purchasePrice: variant.purchasePrice,
      salePrice: variant.salePrice,
      stock: variant.stock,
      minStock: variant.minStock,
    })),
  );
}

export const DEMO_INVENTORY: InventoryItem[] = productsToInventoryItems(DEMO_PRODUCTS);

export const DEMO_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Max Müller", email: "max.mueller@email.de", phone: "+49 170 1234567" },
  { id: "cust-2", name: "Anna Schmidt", email: "anna.schmidt@email.de" },
  { id: "cust-3", name: "Tech Solutions GmbH", email: "einkauf@techsolutions.de" },
];

export const DEMO_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "TB-2026-00184",
    customerId: "cust-1",
    customerName: "Max Müller",
    customerEmail: "max.mueller@email.de",
    createdAt: "2026-08-08T14:32:00Z",
    items: [
      {
        id: "oi-1",
        productName: "iPhone 17 Pro",
        variantLabel: "256 GB · Schwarz",
        sku: "IP17P-256-BLK",
        quantity: 1,
        unitPrice: 1099,
      },
    ],
    subtotal: 1099,
    shipping: 0,
    total: 1099,
    paymentStatus: "paid",
    shippingStatus: "processing",
    status: "processing",
    shippingAddress: "Musterstraße 12, 80331 München",
  },
  {
    id: "ord-2",
    orderNumber: "TB-2026-00183",
    customerId: "cust-2",
    customerName: "Anna Schmidt",
    customerEmail: "anna.schmidt@email.de",
    createdAt: "2026-08-07T09:15:00Z",
    items: [
      {
        id: "oi-2",
        productName: "Galaxy S26 Ultra",
        variantLabel: "512 GB · Schwarz",
        sku: "S26U-512-BLK",
        quantity: 1,
        unitPrice: 1249,
      },
      {
        id: "oi-3",
        productName: "AirPods Pro",
        variantLabel: "Standard",
        sku: "AIRPODS-PRO-2",
        quantity: 1,
        unitPrice: 249,
      },
    ],
    subtotal: 1498,
    shipping: 0,
    total: 1498,
    paymentStatus: "paid",
    shippingStatus: "shipped",
    status: "shipped",
    shippingAddress: "Hauptweg 5, 10115 Berlin",
  },
  {
    id: "ord-3",
    orderNumber: "TB-2026-00182",
    customerId: "cust-3",
    customerName: "Tech Solutions GmbH",
    customerEmail: "einkauf@techsolutions.de",
    createdAt: "2026-08-06T16:45:00Z",
    items: [
      {
        id: "oi-4",
        productName: "MacBook Air",
        variantLabel: "M3 · 16 GB · 512 GB",
        sku: "MBA-M3-512",
        quantity: 3,
        unitPrice: 1199,
      },
    ],
    subtotal: 3597,
    shipping: 0,
    total: 3597,
    paymentStatus: "pending",
    shippingStatus: "pending",
    status: "new",
    shippingAddress: "Industriepark 22, 60314 Frankfurt",
  },
];

export const DEMO_DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 12840.5,
  ordersCount: 184,
  productsCount: 126,
  totalStockUnits: 842,
  lowStockCount: 8,
  outOfStockCount: 3,
  inventoryValue: 428750,
  revenueToday: 1099,
  revenueThisWeek: 4820,
  revenueThisMonth: 12840.5,
};

export const DEMO_REVENUE_7D: RevenueDataPoint[] = [
  { label: "Mo", value: 820 },
  { label: "Di", value: 1240 },
  { label: "Mi", value: 980 },
  { label: "Do", value: 1560 },
  { label: "Fr", value: 1320 },
  { label: "Sa", value: 1890 },
  { label: "So", value: 1099 },
];

export const DEMO_REVENUE_30D: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}.`,
  value: 400 + Math.round(Math.sin(i / 3) * 300 + Math.random() * 400),
}));

export const DEMO_REVENUE_3M: RevenueDataPoint[] = [
  { label: "Jun", value: 11200 },
  { label: "Jul", value: 13850 },
  { label: "Aug", value: 12840 },
];

export const DEMO_REVENUE_12M: RevenueDataPoint[] = [
  { label: "Sep", value: 9200 },
  { label: "Okt", value: 10400 },
  { label: "Nov", value: 14200 },
  { label: "Dez", value: 18600 },
  { label: "Jan", value: 9800 },
  { label: "Feb", value: 11200 },
  { label: "Mär", value: 12400 },
  { label: "Apr", value: 11800 },
  { label: "Mai", value: 13200 },
  { label: "Jun", value: 11200 },
  { label: "Jul", value: 13850 },
  { label: "Aug", value: 12840 },
];

export const DEMO_LOW_STOCK_ALERTS: LowStockAlert[] = [
  {
    id: "var-s26u-512-blk",
    productName: "Galaxy S26 Ultra",
    variantLabel: "512 GB · Schwarz",
    stock: 3,
    minStock: 5,
  },
  {
    id: "var-ip17p-512-org",
    productName: "iPhone 17 Pro Orange",
    variantLabel: "512 GB · Orange",
    stock: 2,
    minStock: 5,
  },
  {
    id: "var-airpods-pro",
    productName: "AirPods Pro",
    variantLabel: "Standard",
    stock: 1,
    minStock: 3,
  },
];

export function getCategoryName(categoryId: string): string {
  return DEMO_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}
