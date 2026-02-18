import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";
import QueryProvider from "@/providers/QueryProvider";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import GoogleAuthProviderWrapper from "@/providers/GoogleAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auraya Studio",
  description: "Modern and Fashion E-Commerce Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAuthProviderWrapper>
          <StoreProvider>
            <QueryProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster />
            </QueryProvider>
          </StoreProvider>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
