import ProductGrid from "@/components/product/ProductGrid";
import type { Product, Pagination } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getNewArrivals(): Promise<{
  products: Product[];
  pagination: Pagination;
}> {
  try {
    const res = await fetch(
      `${API_BASE}/products?sortBy=createdAt&sortOrder=desc`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    const json = await res.json();
    return json.data;
  } catch {
    return {
      products: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

export default async function NewArrivalsPage() {
  const { products, pagination } = await getNewArrivals();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Arrivals</h1>
      <ProductGrid products={products} pagination={pagination} />
    </div>
  );
}
