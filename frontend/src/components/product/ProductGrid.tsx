"use client";

import ProductCard from "./ProductCard";
import type { Product, Pagination } from "@/types";

interface ProductGridProps {
  products: Product[];
  pagination?: Pagination;
}

export default function ProductGrid({ products, pagination }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} isNew={index < 4} />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>
      )}
    </div>
  );
}
