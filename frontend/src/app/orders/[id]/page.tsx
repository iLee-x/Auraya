import OrderDetailContent from "@/components/orders/OrderDetailContent";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50/50">
      <OrderDetailContent orderId={id} />
    </div>
  );
}
