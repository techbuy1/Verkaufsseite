import { OrderDetailContent } from "@/components/admin/OrderDetailContent";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
