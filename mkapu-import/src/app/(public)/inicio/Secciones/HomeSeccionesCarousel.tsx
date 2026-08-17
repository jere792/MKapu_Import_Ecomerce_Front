"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/productCard";

type Producto = {
  id: number;
  code: string;
  name: string;
  category: number;
  description: string;
  price: number;
  featured: boolean;
  image_url: string;
  activo: boolean;
  is_new: boolean;
  category_name?: string;
};

interface Props {
  products: Array<Producto & { category_name?: string }>;
  categoryName: string;
}

export default function HomeSeccionesCarousel({
  products,
  categoryName,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -900,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 900,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <>
      <div
        style={{
          position: "relative",
        }}
      >
        {products.length > 4 && (
          <>
            <button
              type="button"
              onClick={scrollLeft}
              style={{
                position: "absolute",
                left: -18,
                top: "42%",
                transform: "translateY(-50%)",
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "1px solid #ece7de",
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 5,
                transition: "all 0.2s",
              }}
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              style={{
                position: "absolute",
                right: -18,
                top: "42%",
                transform: "translateY(-50%)",
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "1px solid #ece7de",
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 5,
                transition: "all 0.2s",
              }}
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 12,
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                flex: "0 0 calc((100% - 60px) / 4)",
                minWidth: 240,
                maxWidth: 300,
                scrollSnapAlign: "start",
              }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 32,
        }}
      >
        <a
          href={`/productos?cat=${encodeURIComponent(categoryName)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            color: "#f5a623",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
            borderRadius: 8,
          }}
        >
          Ver todos los {categoryName.toLowerCase()}
          <span>→</span>
        </a>
      </div>
    </>
  );
}