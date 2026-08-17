import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EmpresaProvider } from "@/context/EmpresaContext";
import { CartProvider } from "@/app/context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mkapu Import — Equipos de cocina industrial",
    template: "%s | Mkapu Import",
  },
  description:
    "Importación directa de equipos de cocina industrial. Hornos, freidoras, máquinas de hielo y más. Distribución en Lima, Perú.",
  keywords: ["equipos cocina", "importacion", "lima", "peru", "mkapu"],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://mkapu.com",
    siteName: "Mkapu Import",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="icon"
          href="https://res.cloudinary.com/dxuk9bogw/image/upload/w_32,h_32,c_fill/v1767836605/474716814_581641201299027_4444346315622797816_n_karlgu.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="https://res.cloudinary.com/dxuk9bogw/image/upload/w_180,h_180,c_fill/v1767836605/474716814_581641201299027_4444346315622797816_n_karlgu.png"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://kodmbciwlfscwtdaejen.supabase.co" />
        <link rel="dns-prefetch" href="https://kodmbciwlfscwtdaejen.supabase.co" />
      </head>
      <body
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
          backgroundColor: "#fafaf7",
        }}
      >
        <EmpresaProvider>
          <CartProvider>
            {children}
            <WhatsAppButton />
          </CartProvider>
        </EmpresaProvider>
      </body>
    </html>
  );
}