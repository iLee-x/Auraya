import OrdersPageContent from "@/components/orders/OrdersPageContent";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and manage your purchases
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-3xl py-8">
        <OrdersPageContent />
      </div>
    </div>
  );
}
