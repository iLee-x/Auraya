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

  const registerMutation = useMutation({
    mutationFn: (input: { email: string; password: string; name?: string }) =>
      api.post<{ user: User }>("/auth/register", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) =>
      api.post<{ user: User }>("/auth/google", { idToken }),
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
    register: registerMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
