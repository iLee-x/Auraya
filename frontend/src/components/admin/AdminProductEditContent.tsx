"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import ProductForm, { type ProductFormData } from "./ProductForm";
import type { Product } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminProductEditContent({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const {
    data: productData,
    isLoading,
  } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => api.get<{ product: Product }>(`/products/${productId}`),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      api.patch<{ product: Product }>(`/products/${productId}`, {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        stock: data.stock,
        isActive: data.isActive,
        categoryIds: data.categoryIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      api.delete(`/products/${productId}/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
    },
  });

  const handleUploadImages = async (files: FileList) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const res = await fetch(`${API_BASE}/products/${productId}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Upload failed");
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || isLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  const product = productData?.product;

  if (!product) {
    return <p className="text-center py-12 text-muted-foreground">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/products">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <div className="border rounded-lg p-6">
        <ProductForm
          product={product}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          isSubmitting={updateMutation.isPending}
        />
        {updateMutation.isSuccess && (
          <p className="text-sm text-green-600 mt-3">Product updated.</p>
        )}
      </div>

      <Separator />

      {/* Image Management */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>

        {product.images.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {product.images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt="Product image"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  disabled={deleteImageMutation.isPending}
                  onClick={() => deleteImageMutation.mutate(image.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
        )}

        {uploadError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {uploadError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUploadImages(e.target.files);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, GIF. Max 5MB each, up to 10 files.
          </span>
        </div>
      </div>
    </div>
  );
}
