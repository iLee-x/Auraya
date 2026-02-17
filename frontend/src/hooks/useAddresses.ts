"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Address } from "@/types";
import { useAuth } from "./useAuth";

const ADDRESS_QUERY_KEY = ["addresses"];

export function useAddresses() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const addressesQuery = useQuery({
    queryKey: ADDRESS_QUERY_KEY,
    queryFn: () => api.get<{ addresses: Address[] }>("/addresses"),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (
      input: Omit<Address, "id" | "userId">
    ) => api.post<{ address: Address }>("/addresses", input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/addresses/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY }),
  });

  return {
    addresses: addressesQuery.data?.addresses ?? [],
    isLoading: addressesQuery.isLoading,
    createAddress: createMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
