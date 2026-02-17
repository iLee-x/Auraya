import { notFound } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product, Pagination } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getCategoryProducts(slug: string): Promise<{
  products: Product[];
  pagination: Pagination;
  categoryName: string;
} | null> {
  try {
    // Fetch category info
    const catRes = await fetch(`${API_BASE}/categories/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!catRes.ok) return null;
    const catJson = await catRes.json();
    const category = catJson.data.category;

    // Fetch products filtered by category slug
    const prodRes = await fetch(`${API_BASE}/products?categorySlug=${slug}`, {
      next: { revalidate: 60 },
    });
    if (!prodRes.ok) {
      return {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        categoryName: category.name,
      };
    }
    const prodJson = await prodRes.json();

    return {
      products: prodJson.data.products,
      pagination: prodJson.data.pagination,
      categoryName: category.name,
    };
  } catch {
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryProducts(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{data.categoryName}</h1>
      <ProductGrid products={data.products} pagination={data.pagination} />
    </div>
  );
}
