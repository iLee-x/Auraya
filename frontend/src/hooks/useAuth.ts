"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.get<{ user: User }>("/auth/me"),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<{ user: User }>("/auth/login", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post<{ message: string }>("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: userQuery.data?.user ?? null,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data?.user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
