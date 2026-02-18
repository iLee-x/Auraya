"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { selectCartItems, selectCartTotal } from "@/lib/store/slices/cartSlice";
import { setCartSheetOpen } from "@/lib/store/slices/uiSlice";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartSheet() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isCartSheetOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { updateItem, removeItem, isUpdatingItem, isRemovingItem } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(setCartSheetOpen(open))}
    >
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="h-4 w-4" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Sign in to view your cart
            </p>
            <Link href="/login" onClick={() => dispatch(setCartSheetOpen(false))}>
              <Button className="rounded-full h-10 px-8 text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Your cart is empty
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Add items to get started
            </p>
            <Link href="/" onClick={() => dispatch(setCartSheetOpen(false))}>
              <Button className="rounded-full h-10 px-8 text-xs font-semibold">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-5">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => dispatch(setCartSheetOpen(false))}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-50">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                          onClick={() => dispatch(setCartSheetOpen(false))}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          ${parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <button
                            className="h-7 w-7 rounded-l-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
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
                          <span className="h-7 w-8 border-y border-gray-200 flex items-center justify-center text-xs font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            className="h-7 w-7 rounded-r-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
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
                        <button
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 text-center">
                Shipping & taxes calculated at checkout
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => dispatch(setCartSheetOpen(false))}
                  className="block"
                >
                  <Button className="w-full rounded-full h-11 text-xs font-semibold tracking-wider gap-2 bg-gray-900 hover:bg-gray-800">
                    CHECKOUT
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => dispatch(setCartSheetOpen(false))}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-full h-10 text-xs font-medium"
                  >
                    View Cart
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <Lock className="h-3 w-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
