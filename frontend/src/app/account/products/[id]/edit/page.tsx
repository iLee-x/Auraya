import AdminProductEditContent from "@/components/admin/AdminProductEditContent";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <AdminProductEditContent productId={id} />
    </div>
  );
}
