"use client";

import Link from "next/link";
import { Search, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { selectCartItemCount } from "@/lib/store/slices/cartSlice";
import { setCartSheetOpen } from "@/lib/store/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import CartSheet from "@/components/cart/CartSheet";

const navLinks = [
  { href: "/", label: "SHOP" },
  { href: "/categories/electronics", label: "ELECTRONICS" },
  { href: "/categories/clothing", label: "CLOTHING" },
  { href: "/new-arrivals", label: "NEW ARRIVALS" },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Auraya</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-medium tracking-[0.1em] text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:text-gray-900">
            <Search className="h-4 w-4" />
          </Button>

          {isAuthenticated ? (
            <Link href="/account">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative text-gray-600 hover:text-gray-900"
            onClick={() => dispatch(setCartSheetOpen(true))}
          >
            <ShoppingBag className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-gray-900 text-white">
                {cartItemCount}
              </Badge>
            )}
          </Button>

          <CartSheet />
        </div>
      </div>
    </header>
  );
}
