"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store";
import { selectCartItems, selectCartTotal } from "@/lib/store/slices/cartSlice";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartPageContent() {
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    updateItem,
    removeItem,
    clearCart,
    isUpdatingItem,
    isRemovingItem,
    isClearingCart,
  } = useCart();

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Please sign in to view your cart.
        </p>
        <Link href="/login">
          <Button className="rounded-full h-10 px-8 text-xs font-semibold">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Your cart is empty
        </p>
        <p className="text-sm text-gray-400 mb-5">
          Discover something you love and add it here
        </p>
        <Link href="/">
          <Button className="rounded-full h-10 px-8 text-xs font-semibold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Cart Items ({items.length})
            </h2>
            <button
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
              disabled={isClearingCart}
              onClick={async () => {
                try {
                  await clearCart();
                  toast.success("Cart cleared");
                } catch {
                  toast.error("Failed to clear cart");
                }
              }}
            >
              Clear All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex gap-5 p-5">
                {/* Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-24 h-28 rounded-lg overflow-hidden bg-gray-50">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${parseFloat(item.product.price).toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-0 mt-3">
                    <button
                      className="h-8 w-8 rounded-l-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={item.quantity <= 1 || isUpdatingItem}
                      onClick={async () => {
                        try {
                          await updateItem({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          });
                        } catch {
                          toast.error("Failed to update quantity");
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="h-8 w-10 border-y border-gray-200 flex items-center justify-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      className="h-8 w-8 rounded-r-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={
                        item.quantity >= item.product.stock || isUpdatingItem
                      }
                      onClick={async () => {
                        try {
                          await updateItem({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          });
                        } catch {
                          toast.error("Failed to update quantity");
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900">
                    $
                    {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    disabled={isRemovingItem}
                    onClick={async () => {
                      try {
                        await removeItem(item.id);
                        toast.success("Item removed from cart");
                      } catch {
                        toast.error("Failed to remove item");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">
              Order Summary
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
                <span className="font-medium text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-xs text-gray-400">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <Button
              className="w-full rounded-full h-12 text-xs font-semibold tracking-wider gap-2 bg-gray-900 hover:bg-gray-800"
              onClick={() => router.push("/checkout")}
            >
              PROCEED TO CHECKOUT
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Link
              href="/"
              className="block text-center text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>

            {/* Trust signals */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Secure SSL encrypted checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Free shipping on orders over $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
