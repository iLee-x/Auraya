"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/types";

const statusConfig: Record<
  Order["status"],
  { label: string; icon: React.ElementType; className: string; dotColor: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-400",
  },
  PAID: {
    label: "Paid",
    icon: CreditCard,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-400",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-400",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-400",
  },
};

export default function OrdersPageContent() {
  const [page, setPage] = useState(1);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, pagination, isLoading } = useOrders(page);

  if (authLoading || isLoading) {
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
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Please sign in to view your orders.
        </p>
        <Link href="/login">
          <Button className="rounded-full h-10 px-8 text-xs font-semibold">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          No orders yet
        </p>
        <p className="text-sm text-gray-400 mb-5">
          Your order history will appear here
        </p>
        <Link href="/">
          <Button className="rounded-full h-10 px-8 text-xs font-semibold">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const config = statusConfig[order.status];
        const StatusIcon = config.icon;
        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.className}`}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </span>
            </div>
            <div className="h-px bg-gray-100 mb-4" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </Link>
        );
      })}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}
