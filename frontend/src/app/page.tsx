import HeroBanner from "@/components/home/HeroBanner";
import ProductCarousel from "@/components/product/ProductCarousel";
import InstagramGrid from "@/components/home/InstagramGrid";
import type { Product, Pagination } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getProducts(): Promise<{
  products: Product[];
  pagination: Pagination;
}> {
  try {
    const res = await fetch(`${API_BASE}/products?limit=8`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        products: [],
        pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
      };
    }

    const json = await res.json();
    return json.data;
  } catch {
    return {
      products: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
    };
  }
}

export default async function HomePage() {
  const data = await getProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* New Arrivals Carousel */}
      <ProductCarousel title="New Arrivals" products={data.products} />

      {/* Featured Products */}
      {data.products.length > 4 && (
        <ProductCarousel
          title="Best Sellers"
          products={data.products.slice(0, 4)}
        />
      )}

      {/* Instagram Grid */}
      <InstagramGrid />

      {/* Footer Banner */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Auraya Community</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Sign up for exclusive offers, early access to new products, and style inspiration.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
