"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import ProductForm, { type ProductFormData } from "./ProductForm";
import type { Product } from "@/types";

export default function AdminProductCreateContent() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      api.post<{ product: Product }>("/products", {
        name: data.name,
        description: data.description || undefined,
        price: parseFloat(data.price),
        stock: data.stock,
        isActive: data.isActive,
        categoryIds: data.categoryIds.length > 0 ? data.categoryIds : undefined,
      }),
    onSuccess: (data) => {
      router.push(`/account/products/${data.product.id}/edit`);
    },
  });

  if (authLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/products">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Product</h1>
      </div>

      <div className="border rounded-lg p-6">
        <ProductForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          isSubmitting={createMutation.isPending}
        />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        You can upload images after creating the product.
      </p>
    </div>
  );
}
