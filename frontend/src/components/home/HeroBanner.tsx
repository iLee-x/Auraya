"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
}

const slides: BannerSlide[] = [
  {
    title: "Style Built for the Bold",
    subtitle:
      "Discover our latest collection of premium products designed for those who dare to stand out.",
    ctaText: "SHOP ALL PRODUCTS",
    ctaLink: "/products",
    gradient: "from-amber-100 via-orange-50 to-pink-50",
  },
  {
    title: "New Season Arrivals",
    subtitle:
      "Fresh styles just dropped. Be the first to explore our newest additions for the season.",
    ctaText: "EXPLORE NEW IN",
    ctaLink: "/products?sort=newest",
    gradient: "from-blue-100 via-indigo-50 to-purple-50",
  },
  {
    title: "Exclusive Deals Await",
    subtitle:
      "Limited-time offers on top picks. Grab your favorites before they're gone.",
    ctaText: "VIEW DEALS",
    ctaLink: "/products?sort=price_asc",
    gradient: "from-emerald-100 via-teal-50 to-cyan-50",
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.title} className="w-full h-full flex-shrink-0">
            <div
              className={`relative w-full h-full bg-gradient-to-r ${slide.gradient}`}
            >
              <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />

              <div className="relative h-full container mx-auto px-4 flex items-center">
                <div className="max-w-lg space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-gray-600">{slide.subtitle}</p>
                  <Link href={slide.ctaLink}>
                    <Button
                      size="lg"
                      className="bg-black hover:bg-gray-800 text-white rounded-full px-8 text-sm font-medium"
                    >
                      {slide.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-gray-200 bg-white/80 shadow-md hover:bg-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Right Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-gray-200 bg-white/80 shadow-md hover:bg-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-2.5 bg-gray-900"
                : "w-2.5 h-2.5 bg-gray-400 hover:bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Slide indicator */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        {currentSlide + 1} of {slides.length}
      </div>
    </section>
  );
}
