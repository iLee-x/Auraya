"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Order, Pagination } from "@/types";
import { useAuth } from "./useAuth";

export function useOrders(page = 1) {
  const { isAuthenticated } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ["orders", page],
    queryFn: () =>
      api.get<{ orders: Order[]; pagination: Pagination }>("/orders", {
        params: { page: String(page), limit: "10" },
      }),
    enabled: isAuthenticated,
  });

  return {
    orders: ordersQuery.data?.orders ?? [],
    pagination: ordersQuery.data?.pagination,
    isLoading: ordersQuery.isLoading,
  };
}

export function useOrder(id: string) {
  const { isAuthenticated } = useAuth();

  const orderQuery = useQuery({
    queryKey: ["orders", id],
    queryFn: () => api.get<{ order: Order }>(`/orders/${id}`),
    enabled: isAuthenticated && !!id,
  });

  return {
    order: orderQuery.data?.order,
    isLoading: orderQuery.isLoading,
  };
}

export function useCheckout() {
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: (input: { addressId: string }) =>
      api.post<{ order: Order }>("/orders/checkout", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    checkout: checkoutMutation.mutateAsync,
    isCheckingOut: checkoutMutation.isPending,
    error: checkoutMutation.error,
  };
}
