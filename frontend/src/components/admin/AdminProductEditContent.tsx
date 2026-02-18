"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Eye,
  ExternalLink,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: productData, isLoading } = useQuery({
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      api.delete(`/products/${productId}/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
    },
  });

  const handleUploadImages = useCallback(
    async (files: FileList | File[]) => {
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

        queryClient.invalidateQueries({
          queryKey: ["admin", "product", productId],
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [productId, queryClient]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) handleUploadImages(files);
    },
    [handleUploadImages]
  );

  if (authLoading || isLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  const product = productData?.product;

  if (!product) {
    return (
      <p className="text-center py-12 text-muted-foreground">Product not found.</p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account/products">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="rounded-full">
              <Eye className="h-3.5 w-3.5 mr-1" />
              Preview
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — Images (takes more space) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </h2>
              <Badge variant="outline" className="text-xs">
                {product.images.length}/10
              </Badge>
            </div>

            {/* Image grid */}
            {product.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-lg overflow-hidden bg-gray-100 ${
                      index === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      disabled={deleteImageMutation.isPending}
                      onClick={() => deleteImageMutation.mutate(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag & drop images here
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                JPEG, PNG, WebP, GIF — Max 5MB each
              </p>
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
                size="sm"
                className="rounded-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading..." : "Browse Files"}
              </Button>
            </div>

            {uploadError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Product details form */}
        <div className="lg:col-span-3">
          <div className="border rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">Product Details</h2>
            <ProductForm
              product={product}
              onSubmit={async (data) => {
                await updateMutation.mutateAsync(data);
              }}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
