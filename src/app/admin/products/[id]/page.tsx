import { AdminProductEditor } from "@/components/admin/AdminProductEditor";

interface AdminProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { id } = await params;
  return <AdminProductEditor productId={id} />;
}
