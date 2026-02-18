"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Product, Pagination } from "@/types";

export default function AdminProductsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", page, search],
    queryFn: () =>
      api.get<{ products: Product[]; pagination: Pagination }>("/products", {
        params: {
          page: String(page),
          limit: "20",
          includeInactive: "true",
          ...(search ? { search } : {}),
        },
      }),
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  if (authLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    router.push("/account");
    return null;
  }

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/account">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            {pagination && (
              <p className="text-sm text-muted-foreground">
                {pagination.total} product{pagination.total !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
        </div>
        <Link href="/account/products/new">
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-1" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            {search ? "No products match your search." : "No products yet."}
          </p>
          {!search && (
            <Link href="/account/products/new">
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Create your first product
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/account/products/${product.id}/edit`}
              className="group border rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-gray-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-50">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="h-10 w-10 mb-1" />
                    <span className="text-xs">No image</span>
                  </div>
                )}

                {/* Status overlay */}
                {!product.isActive && (
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className="bg-gray-900/70 text-white border-0 backdrop-blur-sm"
                    >
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  </div>
                )}

                {/* Image count */}
                {product.images.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {product.images.length} photos
                    </span>
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/account/products/${product.id}/edit`);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-600"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => handleDelete(e, product.id, product.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <span className="font-bold text-sm whitespace-nowrap">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {product.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {product.categories.length > 2 && (
                      <span className="text-[11px] text-gray-400">
                        +{product.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Stock indicator */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 10
                          ? "bg-green-500"
                          : product.stock > 0
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        product.stock === 0
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
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
