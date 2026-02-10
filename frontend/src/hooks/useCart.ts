"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/lib/store";
import {
  setCartItems,
  setCartLoading,
} from "@/lib/store/slices/cartSlice";
import type { Cart } from "@/types";
import { useAuth } from "./useAuth";

const CART_QUERY_KEY = ["cart"];

export function useCart() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      dispatch(setCartLoading(true));
      try {
        const data = await api.get<{ cart: Cart }>("/cart");
        dispatch(setCartItems(data.cart.items));
        return data.cart;
      } finally {
        dispatch(setCartLoading(false));
      }
    },
    enabled: isAuthenticated,
  });

  const syncCartToRedux = (cart: Cart) => {
    dispatch(setCartItems(cart.items));
    queryClient.setQueryData(CART_QUERY_KEY, cart);
  };

  const addItemMutation = useMutation({
    mutationFn: (input: { productId: string; quantity?: number }) =>
      api.post<{ cart: Cart }>("/cart/items", input),
    onSuccess: (data) => syncCartToRedux(data.cart),
  });

  const updateItemMutation = useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) =>
      api.patch<{ cart: Cart }>(`/cart/items/${input.itemId}`, {
        quantity: input.quantity,
      }),
    onSuccess: (data) => syncCartToRedux(data.cart),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      api.delete<{ cart: Cart }>(`/cart/items/${itemId}`),
    onSuccess: (data) => syncCartToRedux(data.cart),
  });

  const clearCartMutation = useMutation({
    mutationFn: () => api.delete<{ cart: Cart }>("/cart"),
    onSuccess: (data) => syncCartToRedux(data.cart),
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
