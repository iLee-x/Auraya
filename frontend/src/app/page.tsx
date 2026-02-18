import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
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

const perks = [
  { icon: Truck, label: "Free Shipping", detail: "On orders over $50" },
  { icon: Shield, label: "Secure Payment", detail: "100% protected" },
  { icon: RotateCcw, label: "Easy Returns", detail: "30-day returns" },
  { icon: Headphones, label: "24/7 Support", detail: "Dedicated help" },
];

export default async function HomePage() {
  const data = await getProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* New Arrivals Carousel */}
      <ProductCarousel
        title="New Arrivals"
        subtitle="The latest additions to our collection"
        products={data.products}
      />

      {/* Featured Products */}
      {data.products.length > 4 && (
        <div className="bg-gray-50/50">
          <ProductCarousel
            title="Best Sellers"
            subtitle="Our most loved pieces this season"
            products={data.products.slice(0, 4)}
          />
        </div>
      )}

      {/* Instagram Grid */}
      <InstagramGrid />

      {/* Perks Bar */}
      <section className="border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {perks.map((perk) => (
              <div
                key={perk.label}
                className="flex items-center justify-center gap-3 py-6 px-4"
              >
                <perk.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 tracking-wide">
                    {perk.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{perk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-950 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
            Join the Auraya Community
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Sign up for exclusive offers, early access to new products, and
            style inspiration delivered to your inbox.
          </p>
          <div className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3 bg-white/10 border border-white/10 rounded-l-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/15 transition-colors"
            />
            <button className="bg-white text-gray-900 px-7 py-3 rounded-r-full text-xs font-semibold tracking-wider hover:bg-gray-100 transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
