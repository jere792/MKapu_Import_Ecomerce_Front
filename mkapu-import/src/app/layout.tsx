"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isAdminLogin = pathname.includes("/admin/login");

  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", margin: 0, padding: 0 }}
      >
        <CartProvider>
          {!isAdmin && <Navbar />}
          <main style={{ flex: 1 }}>{children}</main>
          {!isAdmin && <Footer />}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}