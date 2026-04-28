"use client";
import { useEffect, useRef, useState } from "react";
import { getMarcas, Marca } from "@/lib/queries";

export default function BrandsCarousel() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMarcas().then(setMarcas);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || marcas.length === 0) return;
    let pos = 0;
    const speed = 0.5;
    let raf: number;
    const step = () => {
      pos -= speed;
      if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [marcas]);

  if (marcas.length === 0) return null;

  const doubled = [...marcas, ...marcas];

  return (
    <section className="brands-section">
      <div className="brands-header">
        <span className="brands-tag">Nuestras Marcas</span>
        <h2 className="brands-title">Marcas que distribuimos</h2>
      </div>
      <div className="brands-wrapper">
        <div className="brands-track" ref={trackRef}>
          {doubled.map((m, i) => (
            <div key={`${m.id}-${i}`} className="brands-item">
              {m.logo_url ? (
                <img src={m.logo_url} alt={m.name} className="brands-logo" />
              ) : (
                <span className="brands-name">{m.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .brands-section {
          padding: 4rem 1.5rem;
          background: #fff;
          overflow: hidden;
        }
        .brands-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .brands-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }
        .brands-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #1a1a1a;
          margin: 0;
        }
        .brands-wrapper {
          overflow: hidden;
          width: 100%;
        }
        .brands-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          will-change: transform;
        }
        .brands-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 140px;
          height: 80px;
          background: #f9f9f9;
          border: 1px solid #efefef;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          transition: box-shadow 0.2s;
        }
        .brands-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .brands-logo {
          max-height: 48px;
          max-width: 110px;
          object-fit: contain;
          filter: grayscale(1);
          opacity: 0.7;
          transition: filter 0.2s, opacity 0.2s;
        }
        .brands-item:hover .brands-logo {
          filter: grayscale(0);
          opacity: 1;
        }
        .brands-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #555;
          white-space: nowrap;
        }
      `}</style>
    </section>
  );
}