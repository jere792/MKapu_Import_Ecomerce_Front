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
    <div className="ig-wrap">
      <div className="ig-main" onClick={() => setLightbox(true)}>
        <img src={active.url_imagenes} alt={productName} className="ig-main-img" />
        {allImages.length > 1 && (
          <>
            <button className="ig-arrow ig-arrow--left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <button className="ig-arrow ig-arrow--right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          </>
        )}
        <span className="ig-zoom">🔍</span>
      </div>

      {allImages.length > 1 && (
        <div className="ig-thumbs">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`ig-thumb${i === activeIndex ? " ig-thumb--active" : ""}`}
            >
              <img src={img.url_imagenes} alt={`${productName} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="ig-lightbox" onClick={() => setLightbox(false)}>
          <button className="ig-lb-close">✕</button>
          <button className="ig-lb-arrow ig-lb-arrow--left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={active.url_imagenes} alt={productName} className="ig-lb-img" onClick={(e) => e.stopPropagation()} />
          <button className="ig-lb-arrow ig-lb-arrow--right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}

      <style>{`
        .ig-wrap { display: flex; flex-direction: column; gap: 0.75rem; }
        .ig-main {
          position: relative;
          aspect-ratio: 1;
          background: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
          cursor: zoom-in;
        }
        .ig-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .ig-main:hover .ig-main-img { transform: scale(1.04); }
        .ig-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 1.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: background 0.15s;
        }
        .ig-arrow:hover { background: rgba(0,0,0,0.7); }
        .ig-arrow--left { left: 10px; }
        .ig-arrow--right { right: 10px; }
        .ig-zoom {
          position: absolute;
          bottom: 10px;
          right: 12px;
          font-size: 1rem;
          opacity: 0.5;
        }
        .ig-thumbs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .ig-thumb {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          background: #f0f0f0;
          transition: border-color 0.15s;
        }
        .ig-thumb--active { border-color: #f5a623; }
        .ig-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ig-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ig-lb-img {
          max-width: 90vw;
          max-height: 88vh;
          object-fit: contain;
          border-radius: 8px;
        }
        .ig-lb-close {
          position: absolute;
          top: 20px;
          right: 24px;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.6rem;
          cursor: pointer;
          opacity: 0.7;
        }
        .ig-lb-close:hover { opacity: 1; }
        .ig-lb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          font-size: 1.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .ig-lb-arrow:hover { background: rgba(255,255,255,0.25); }
        .ig-lb-arrow--left { left: 20px; }
        .ig-lb-arrow--right { right: 20px; }
      `}</style>
    </div>
  );
}