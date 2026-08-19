import { ProductDetailPageClient } from "@/components/product/ProductDetailPageClient";
import { resolvePremiumProduct } from "@/lib/catalog";
import { redirect } from "next/navigation";

interface ProductByIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductByIdPage({ params }: ProductByIdPageProps) {
  const { id } = await params;
  const product = resolvePremiumProduct(id);

  if (!product) {
    redirect("/");
  }

  return <ProductDetailPageClient slug={product.slug} />;
}
