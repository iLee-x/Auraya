"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export default function ProductCard({ product, isNew = false }: ProductCardProps) {
  const { addItem, isAddingItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add item to cart");
    }
  };

  // Mock rating data (in real app, this would come from the backend)
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 100) + 10;

  return (
    <div className="group flex flex-col">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-sm">No image</span>
            </div>
          )}

          {/* New Badge */}
          {isNew && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide">
              NEW
            </span>
          )}

          {/* Quick Add Overlay */}
          <button
            className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-900 hover:text-white text-gray-700 disabled:opacity-50"
            disabled={isAddingItem || product.stock === 0 || !isAuthenticated}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-1.5">
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-px">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({reviewCount})</span>
        </div>

        {/* Price */}
        <p className="text-sm font-semibold text-gray-900">
          ${parseFloat(product.price).toFixed(2)}
        </p>

        {product.stock === 0 && (
          <p className="text-xs font-medium text-red-500">Out of stock</p>
        )}
      </div>
    </div>
  );
}
