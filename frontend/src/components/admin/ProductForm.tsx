"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: number;
  isActive: boolean;
  categoryIds: string[];
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? parseFloat(product.price).toString() : "",
    stock: product?.stock ?? 0,
    isActive: product?.isActive ?? true,
    categoryIds: product?.categories.map((c) => c.id) ?? [],
  });
  const [error, setError] = useState("");

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories", "flat"],
    queryFn: () =>
      api.get<{ categories: Category[] }>("/categories", {
        params: { flat: "true" },
      }),
  });

  const categories = categoriesData?.categories ?? [];

  const handleChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.price || parseFloat(form.price) < 0) {
      setError("Valid price is required");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Name *</label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Price *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Stock</label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => handleChange("isActive", e.target.checked)}
          className="rounded border-gray-300"
        />
        Active (visible to customers)
      </label>

      {categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.categoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-gray-300"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
