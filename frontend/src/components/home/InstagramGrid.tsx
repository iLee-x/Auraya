"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";

const instagramImages = [
  { id: 1, color: "bg-amber-100" },
  { id: 2, color: "bg-emerald-100" },
  { id: 3, color: "bg-sky-100" },
  { id: 4, color: "bg-pink-100" },
  { id: 5, color: "bg-violet-100" },
  { id: 6, color: "bg-orange-100" },
];

export default function InstagramGrid() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Shop Our Instagram
          </h2>
          <p className="text-sm text-gray-400">
            Follow us for daily inspiration and style
          </p>
          <div className="mx-auto mt-3 w-12 h-0.5 bg-gray-900 rounded-full" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {instagramImages.map((img) => (
            <Link
              key={img.id}
              href="#"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <div
                className={`w-full h-full ${img.color} transition-transform duration-500 group-hover:scale-110`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
              </div>
            </Link>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-8">
          <Link
            href="https://instagram.com"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Instagram className="h-4 w-4" />
            @auraya_official
          </Link>
        </div>
      </div>
    </section>
  );
}
