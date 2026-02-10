"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Sign in to view your cart</p>
            <Link href="/login" onClick={() => dispatch(setCartSheetOpen(false))}>
              <Button className="rounded-full">Sign In</Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/" onClick={() => dispatch(setCartSheetOpen(false))}>
              <Button className="rounded-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                      onClick={() => dispatch(setCartSheetOpen(false))}
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm font-bold mt-1">
                      ${parseFloat(item.product.price).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border rounded-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          disabled={item.quantity <= 1 || isUpdatingItem}
                          onClick={() =>
                            updateItem({
                              itemId: item.id,
                              quantity: item.quantity - 1,
                            })
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
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
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        disabled={isRemovingItem}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              {/* Promo */}
              <div className="bg-pink-50 rounded-lg p-3 text-center">
                <p className="text-xs">
                  Use code <span className="font-bold text-primary">SAVE20</span> at
                  checkout
                </p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Shipping & taxes calculated at checkout
              </p>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full rounded-full h-11 bg-primary hover:bg-primary/90">
                  Checkout
                </Button>
                <Link
                  href="/cart"
                  onClick={() => dispatch(setCartSheetOpen(false))}
                  className="block"
                >
                  <Button variant="outline" className="w-full rounded-full h-11">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
