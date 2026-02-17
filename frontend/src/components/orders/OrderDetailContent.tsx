"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/useOrders";
import type { Order } from "@/types";

const statusVariant: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "default",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default function OrderDetailContent({ orderId }: { orderId: string }) {
  const { order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <p className="text-center py-12 text-muted-foreground">Loading...</p>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
      </div>

      {/* Shipping Address */}
      <div className="border rounded-lg p-6">
        <h2 className="font-bold mb-3">Shipping Address</h2>
        <div className="text-sm space-y-1">
          <p className="font-medium">{addr.recipientName}</p>
          {addr.phone && <p className="text-muted-foreground">{addr.phone}</p>}
          <p>
            {addr.addressLine1}
            {addr.addressLine2 && `, ${addr.addressLine2}`}
          </p>
          <p>
            {addr.city}, {addr.state} {addr.postalCode}
          </p>
          <p>{addr.country}</p>
        </div>
      </div>

      {/* Items */}
      <div className="border rounded-lg p-6">
        <h2 className="font-bold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-medium hover:underline"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  ${parseFloat(item.productPrice).toFixed(2)} x {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                $
                {(parseFloat(item.productPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
