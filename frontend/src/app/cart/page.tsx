import CartPageContent from "@/components/cart/CartPageContent";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review your items before checkout
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <CartPageContent />
      </div>
    </div>
  );
}
