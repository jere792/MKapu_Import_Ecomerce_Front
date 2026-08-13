"use client";
import { useState } from "react";
import type { ProductoImagen } from "@/lib/queries";

interface Props {
  mainImage?: string;
  imagenes: ProductoImagen[];
  productName: string;
}

export default function ImageGallery({ mainImage, imagenes, productName }: Props) {
  const allImages = [
    ...(mainImage ? [{ id: 0, url_imagenes: mainImage, orden: -1, producto_id: 0, created_at: "" }] : []),
    ...imagenes,
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (allImages.length === 0) return null;

  const active = allImages[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square bg-[#f5f5f5] rounded-xl overflow-hidden cursor-zoom-in" onClick={() => setLightbox(true)}>
        <img src={active.url_imagenes} alt={productName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        {allImages.length > 1 && (
          <>
            <button className="absolute top-1/2 -translate-y-1/2 bg-black/45 text-white border-0 rounded-full w-9 h-9 text-[1.4rem] cursor-pointer flex items-center justify-center z-[2] transition-colors hover:bg-black/70 left-[10px]" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <button className="absolute top-1/2 -translate-y-1/2 bg-black/45 text-white border-0 rounded-full w-9 h-9 text-[1.4rem] cursor-pointer flex items-center justify-center z-[2] transition-colors hover:bg-black/70 right-[10px]" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          </>
        )}
        <span className="absolute bottom-2.5 right-3 text-base opacity-50">🔍</span>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent cursor-pointer p-0 bg-[#f0f0f0] transition-colors duration-150${i === activeIndex ? " border-brand" : ""}`}
            >
              <img src={img.url_imagenes} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.92)] z-[1000] flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-5 right-6 bg-transparent border-0 text-white text-[1.6rem] cursor-pointer opacity-70 hover:opacity-100">✕</button>
          <button className="absolute top-1/2 -translate-y-1/2 bg-white/10 text-white border-0 rounded-full w-12 h-12 text-[1.8rem] cursor-pointer flex items-center justify-center transition-colors hover:bg-white/25 left-5" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={active.url_imagenes} alt={productName} className="max-w-[90vw] max-h-[88vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 -translate-y-1/2 bg-white/10 text-white border-0 rounded-full w-12 h-12 text-[1.8rem] cursor-pointer flex items-center justify-center transition-colors hover:bg-white/25 right-5" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </div>
  );
}