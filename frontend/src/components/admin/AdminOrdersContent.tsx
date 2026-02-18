"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const statusVariant: Record<
  Order["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  PAID: "default",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
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
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">All Orders</h1>
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {order.userId && (
                      <span> &middot; User: {order.userId.slice(-8)}</span>
                    )}
                    {!order.userId && <span> &middot; Guest</span>}
                  </p>
                </div>
                <Badge variant={statusVariant[order.status]}>
                  {order.status}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""} &middot;{" "}
                  <span className="font-semibold text-foreground">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: order.id,
                        status: e.target.value,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
