"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { selectCartItems, selectCartTotal, clearCartState } from "@/lib/store/slices/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses } from "@/hooks/useAddresses";
import { useCheckout } from "@/hooks/useOrders";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

export default function CheckoutPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addresses, isLoading: addressesLoading, createAddress, isCreating } =
    useAddresses();
  const { checkout, isCheckingOut } = useCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Auto-select default address
  const defaultAddress = addresses.find((a) => a.isDefault);
  const activeAddressId = selectedAddressId ?? defaultAddress?.id ?? null;

  if (authLoading || addressesLoading) {
    return (
      <p className="text-center py-12 text-muted-foreground">Loading...</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Please sign in to checkout.
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

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    try {
      const data = await checkout({ addressId: activeAddressId });
      dispatch(clearCartState());
      toast.success("Order placed successfully!");
      router.push(`/orders/${data.order.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order"
      );
    }
  };

  const handleAddAddress = async (data: Parameters<typeof createAddress>[0]) => {
    try {
      const result = await createAddress(data);
      setSelectedAddressId(result.address.id);
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save address"
      );
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Shipping Address */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={activeAddressId === address.id}
                  onSelect={() => setSelectedAddressId(address.id)}
                />
              ))}
            </div>
          )}

          {showAddressForm ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">New Address</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddressForm(false)}
                >
                  Cancel
                </Button>
              </div>
              <AddressForm onSubmit={handleAddAddress} isLoading={isCreating} />
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowAddressForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          )}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="border rounded-lg p-6 h-fit space-y-4">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <Separator />
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.product.images[0] && (
                <Image
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-muted-foreground">Free</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={isCheckingOut || !activeAddressId}
        >
          {isCheckingOut ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
