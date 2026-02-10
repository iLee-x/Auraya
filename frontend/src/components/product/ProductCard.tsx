"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    if (!isAuthenticated) return;
    await addItem({ productId: product.id, quantity: 1 });
  };

  // Mock rating data (in real app, this would come from the backend)
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 100) + 10;

  return (
    <div className="group flex flex-col">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* New Badge */}
          {isNew && (
            <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-semibold px-2 py-1 rounded-full">
              New
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{reviewCount} REVIEWS</span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:underline line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-sm text-gray-500">
          FROM ${parseFloat(product.price).toFixed(0)}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white text-[10px] font-semibold px-3 h-7 rounded-full"
            disabled={isAddingItem || product.stock === 0 || !isAuthenticated}
            onClick={handleAddToCart}
          >
            SHOP NOW
          </Button>
          <span className="text-[10px] text-gray-400">+ CODE: SAVE20</span>
        </div>

        {product.stock === 0 && (
          <p className="text-xs text-red-500">Out of stock</p>
        )}
      </div>
    </div>
  );
}
