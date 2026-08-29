import type { Product } from "@/data/products";
import { ProductCardStatic } from "@/components/shop/ProductCardStatic";

interface StoreProductGridStaticProps {
  products: Product[];
}

export function StoreProductGridStatic({ products }: StoreProductGridStaticProps) {
  return (
    <div className="grid grid-cols-2 justify-items-stretch gap-3 min-[480px]:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5">
      {products.map((product, index) => (
        <ProductCardStatic key={product.id} product={product} size="compact" priority={index < 8} />
      ))}
    </div>
  );
}
