"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  accentColor: string;
}

const slides: BannerSlide[] = [
  {
    title: "Style Built for the Bold",
    subtitle:
      "Discover our latest collection of premium products designed for those who dare to stand out.",
    ctaText: "SHOP ALL PRODUCTS",
    ctaLink: "/products",
    gradient: "from-amber-50 via-orange-50 to-rose-100",
    accentColor: "bg-orange-200/40",
  },
  {
    title: "New Season Arrivals",
    subtitle:
      "Fresh styles just dropped. Be the first to explore our newest additions for the season.",
    ctaText: "EXPLORE NEW IN",
    ctaLink: "/products?sort=newest",
    gradient: "from-slate-50 via-blue-50 to-indigo-100",
    accentColor: "bg-indigo-200/40",
  },
  {
    title: "Exclusive Deals Await",
    subtitle:
      "Limited-time offers on top picks. Grab your favorites before they're gone.",
    ctaText: "VIEW DEALS",
    ctaLink: "/products?sort=price_asc",
    gradient: "from-emerald-50 via-teal-50 to-cyan-100",
    accentColor: "bg-teal-200/40",
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
      className="relative w-full h-[520px] md:h-[620px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.title} className="w-full h-full flex-shrink-0">
            <div
              className={`relative w-full h-full bg-gradient-to-br ${slide.gradient}`}
            >
              {/* Decorative blurred shapes */}
              <div
                className={`absolute top-1/4 right-[15%] w-72 h-72 ${slide.accentColor} rounded-full blur-3xl`}
              />
              <div
                className={`absolute bottom-1/4 right-[30%] w-56 h-56 ${slide.accentColor} rounded-full blur-3xl`}
              />
              <div
                className={`absolute top-[60%] right-[10%] w-40 h-40 ${slide.accentColor} rounded-full blur-2xl`}
              />

              <div className="relative h-full container mx-auto px-6 md:px-8 flex items-center">
                <div className="max-w-xl space-y-8">
                  <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500">
                    {currentSlide + 1} / {slides.length} &mdash; Auraya Studio
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-md">
                    {slide.subtitle}
                  </p>
                  <Link href={slide.ctaLink}>
                    <Button
                      size="lg"
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-full pl-8 pr-6 h-12 text-xs font-semibold tracking-wider gap-2 transition-all duration-300 hover:gap-3"
                    >
                      {slide.ctaText}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        onClick={nextSlide}
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "w-10 h-2.5 bg-gray-900"
                : "w-2.5 h-2.5 bg-gray-900/25 hover:bg-gray-900/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
