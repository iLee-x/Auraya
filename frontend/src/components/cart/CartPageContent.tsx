"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/lib/store";
import { selectCartItems, selectCartTotal } from "@/lib/store/slices/cartSlice";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartPageContent() {
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
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Please sign in to view your cart.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
            {item.product.images[0] && (
              <Image
                src={item.product.images[0].url}
                alt={item.product.name}
                width={96}
                height={96}
                className="rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-medium hover:underline"
              >
                {item.product.name}
              </Link>
              <p className="text-muted-foreground">
                ${parseFloat(item.product.price).toFixed(2)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={item.quantity <= 1 || isUpdatingItem}
                  onClick={() =>
                    updateItem({
                      itemId: item.id,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={
                    item.quantity >= item.product.stock || isUpdatingItem
                  }
                  onClick={() =>
                    updateItem({
                      itemId: item.id,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="font-bold">
                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                disabled={isRemovingItem}
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="text-destructive"
          disabled={isClearingCart}
          onClick={() => clearCart()}
        >
          Clear Cart
        </Button>
      </div>

      <div className="border rounded-lg p-6 h-fit space-y-4">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-muted-foreground">
              Calculated at checkout
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
