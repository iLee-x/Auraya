"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-orange-50 to-pink-50">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Style Built for the Bold
          </h1>
          <p className="text-lg text-gray-600">
            Discover our latest collection of premium products designed for those who dare to stand out.
          </p>
          <Link href="/products">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white rounded-full px-8 text-sm font-medium"
            >
              SHOP ALL PRODUCTS
            </Button>
          </Link>
        </div>
      </div>

      {/* Slide indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        1 of 1
      </div>
    </section>
  );
}
