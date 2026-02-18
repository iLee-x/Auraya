"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Order, Pagination } from "@/types";

const ORDER_STATUSES: Order["status"][] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

export default function AdminOrdersContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", page],
    queryFn: () =>
      api.get<{ orders: Order[]; pagination: Pagination }>("/orders/admin/all", {
        params: { page: String(page), limit: "20" },
      }),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Orders</h1>
              {pagination && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {pagination.total} order{pagination.total !== 1 ? "s" : ""} total
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No orders yet
            </p>
            <p className="text-sm text-gray-400">
              Orders will appear here when customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-gray-200">|</span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <User className="h-3 w-3" />
                          {order.userId
                            ? order.userId.slice(-8).toUpperCase()
                            : "Guest"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100" />

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Items</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.items.length}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-sm font-bold text-gray-900">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-gray-400 font-medium">
                        Update:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-colors hover:border-gray-300"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
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
    </div>
  );
}
