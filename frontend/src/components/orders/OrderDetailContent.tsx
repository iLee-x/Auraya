"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useOrders";
import type { Order } from "@/types";

const statusConfig: Record<
  Order["status"],
  { label: string; icon: React.ElementType; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    icon: CreditCard,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function OrderDetailContent({ orderId }: { orderId: string }) {
  const { order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-5">Order not found.</p>
        <Link href="/orders">
          <Button className="rounded-full h-10 px-8 text-xs font-semibold">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress;
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl py-10">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${config.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
        {/* Shipping Address */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
            <MapPin className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">
              Shipping Address
            </h2>
          </div>
          <div className="px-6 py-5 text-sm space-y-1">
            <p className="font-medium text-gray-900">{addr.recipientName}</p>
            {addr.phone && (
              <p className="text-gray-400 text-xs">{addr.phone}</p>
            )}
            <p className="text-gray-500">
              {addr.addressLine1}
              {addr.addressLine2 && `, ${addr.addressLine2}`}
            </p>
            <p className="text-gray-500">
              {addr.city}, {addr.state} {addr.postalCode}
            </p>
            <p className="text-gray-500">{addr.country}</p>
          </div>
        </section>

        {/* Items */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
            <Package className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">
              Items ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ${parseFloat(item.productPrice).toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-4">
                  $
                  {(parseFloat(item.productPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                ${parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
