"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Star, ShoppingBag, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, isAddingItem } = useCart();
  const { isAuthenticated } = useAuth();

  // Mock rating data
  const rating = 4.5;
  const reviewCount = 127;

  const handleAddToCart = async () => {
    if (!isAuthenticated) return;
    await addItem({ productId: product.id, quantity });
    setQuantity(1);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage].url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  index === selectedImage
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={image.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        {product.categories.length > 0 && (
          <p className="text-sm text-gray-500">
            {product.categories.map((cat) => cat.name).join(" / ")}
          </p>
        )}

        {/* Title & Rating */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {reviewCount} reviews
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ${(parseFloat(product.price) * 1.2).toFixed(2)}
          </span>
          <span className="text-sm text-primary font-medium">Save 20%</span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full h-12"
            disabled={isAddingItem || product.stock === 0 || !isAuthenticated}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            {!isAuthenticated
              ? "Sign in to add to cart"
              : isAddingItem
              ? "Adding..."
              : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full p-0"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full p-0"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Promo Code */}
        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <p className="text-sm">
            Use code <span className="font-bold text-primary">SAVE20</span> for
            20% off your first order!
          </p>
        </div>

        {/* Features */}
        <div className="border-t pt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              ✓
            </span>
            Free shipping on orders over $50
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              ✓
            </span>
            30-day money-back guarantee
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              ✓
            </span>
            Secure checkout
          </div>
        </div>
      </div>
    </div>
  );
}
