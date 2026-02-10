"use client";

import Image from "next/image";
import Link from "next/link";

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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Shop our Instagram
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {instagramImages.map((img) => (
            <Link
              key={img.id}
              href="#"
              className="aspect-square relative overflow-hidden group"
            >
              <div
                className={`w-full h-full ${img.color} flex items-center justify-center`}
              >
                <div className="text-4xl opacity-30">📸</div>
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">View</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-8">
          <Link
            href="https://instagram.com"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            @auraya_official
          </Link>
        </div>
      </div>
    </section>
  );
}
