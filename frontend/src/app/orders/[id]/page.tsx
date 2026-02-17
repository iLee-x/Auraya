import OrderDetailContent from "@/components/orders/OrderDetailContent";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetailContent orderId={id} />
    </div>
  );
}
