import { ProductDetailPageClient } from "@/components/product/ProductDetailPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailPageClient slug={slug} />;
}
