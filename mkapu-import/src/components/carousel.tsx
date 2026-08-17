/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/productCard";

interface Product {
  id: number;
  code: string;
  name: string;
  category: number | null;
  description: string;
  price: number;
  oldPrice: number;
  featured: boolean;
  is_new?: boolean;
  low_stock?: boolean;
  agotado?: boolean;
  image_url?: string;
  category_name?: string;
}

interface Props {
  products: Product[];
  title?: string;
  promocionesMap?: Record<number, { tipo_descuento: string; valor_descuento: number }>;
}

export default function Carousel({ products, title = "Destacados", promocionesMap = {} }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // NUEVO: Guardaremos las posiciones exactas donde el carrusel puede detenerse
  const [snapPoints, setSnapPoints] = useState<number[]>([]);

  const total = products.length;

  // Obtiene el ancho real de la tarjeta + su gap (margen)
  const getCardWidth = useCallback(() => {
    if (!trackRef.current) return 220;
    const slide = trackRef.current.querySelector(".carousel__slide") as HTMLElement;
    return slide ? slide.offsetWidth + 12 : 220;
  }, []);

  // Calcula exactamente en qué posiciones de scroll deben existir puntos (dots)
  const updateLayout = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollWidth, clientWidth } = trackRef.current;
    
    // maxScroll es lo máximo que la barra puede desplazarse a la derecha
    const maxScroll = scrollWidth - clientWidth;

    // Si los productos no superan el ancho de pantalla, no hay puntos (lista corta)
    if (maxScroll <= 5) {
      setSnapPoints([]);
      setActiveIdx(0);
      return;
    }

    const cw = getCardWidth();
    const points: number[] = [];
    
    // Agregamos un punto por cada salto posible
    for (let p = 0; p < maxScroll; p += cw) {
      points.push(p);
    }

    // Aseguramos que el último punto represente el tope exacto del carrusel
    const lastPoint = points[points.length - 1];
    if (maxScroll - lastPoint > cw * 0.2) {
      points.push(maxScroll);
    } else {
      points[points.length - 1] = maxScroll;
    }

    setSnapPoints(points);
  }, [getCardWidth]);

  // Se ejecuta al montar y recalcula si se redimensiona la pantalla
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateLayout();

    const observer = new ResizeObserver(() => updateLayout());
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateLayout, total]);

  // Ilumina el dot más cercano a nuestra posición actual de scroll
  const handleScroll = useCallback(() => {
    if (!trackRef.current || snapPoints.length === 0) return;
    const currentScroll = trackRef.current.scrollLeft;

    let closestIdx = 0;
    let minDiff = Infinity;

    snapPoints.forEach((pt, i) => {
      const diff = Math.abs(currentScroll - pt);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setActiveIdx(closestIdx);
  }, [snapPoints]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Mueve el carrusel hacia uno de los puntos exactos calculados
  function scrollTo(idx: number) {
    if (!trackRef.current || snapPoints.length === 0) return;
    const targetPos = snapPoints[idx];
    trackRef.current.scrollTo({ left: targetPos, behavior: "smooth" });
    setActiveIdx(idx);
  }

  const dotCount = snapPoints.length;

  function prev() {
    scrollTo(Math.max(activeIdx - 1, 0));
  }
  function next() {
    scrollTo(Math.min(activeIdx + 1, dotCount - 1));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft - (x - startX) * 1.2;
  }

  function onMouseUp() {
    setIsDragging(false);
  }

  return (
    <section className="pt-7 pb-7 pl-5">
      {title && <h2 className="text-xl font-extrabold mb-3.5 pr-5">{title}</h2>}

      <div className="relative">
        <button
          className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border border-[#e4d9c8] bg-white text-[#1a1a1a] inline-flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#e4d9c8] disabled:hover:text-[#1a1a1a]"
          onClick={prev}
          disabled={activeIdx === 0}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          className="flex gap-3 overflow-x-auto pb-2.5 pr-5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {products.map((p) => (
            <div
              className="carousel__slide shrink-0 w-[calc((100%-36px)/4)] snap-start max-[900px]:w-[calc((100%-24px)/3)] max-[640px]:w-[calc((100%-12px)/2)] max-[400px]:w-[calc(100%-12px)]"
              key={p.id}
            >
              <ProductCard product={{ ...p, descuento: promocionesMap[p.id] ?? undefined }} />
            </div>
          ))}
        </div>

        <button
          className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border border-[#e4d9c8] bg-white text-[#1a1a1a] inline-flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#e4d9c8] disabled:hover:text-[#1a1a1a]"
          onClick={next}
          disabled={dotCount === 0 || activeIdx >= dotCount - 1}
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* SOLO renderizar dots si realmente hay más de una página posible */}
      {dotCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4" role="tablist">
          {snapPoints.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeIdx ? "bg-brand" : "bg-[#d8cfc2] hover:bg-[#c4b9a8]"}`}
              onClick={() => scrollTo(i)}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}