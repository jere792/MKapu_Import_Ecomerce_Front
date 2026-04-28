"use client";
import { useEffect, useRef, useState } from "react";
import { getColaboradores, Colaborador } from "@/lib/queries";

export default function CollaboratorsCarousel() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getColaboradores().then(setColaboradores);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || colaboradores.length === 0) return;
    let pos = 0;
    const speed = 0.4;
    let raf: number;
    const step = () => {
      pos -= speed;
      if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [colaboradores]);

  if (colaboradores.length === 0) return null;

  const doubled = [...colaboradores, ...colaboradores];

  return (
    <section className="collab-section">
      <div className="collab-header">
        <span className="collab-tag">Colaboraciones</span>
        <h2 className="collab-title">Con quienes hemos trabajado</h2>
      </div>
      <div className="collab-wrapper">
        <div className="collab-track" ref={trackRef}>
          {doubled.map((c, i) => (
            <div key={`${c.id}-${i}`} className="collab-item">
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="collab-link">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="collab-logo" />
                  ) : (
                    <span className="collab-name">{c.name}</span>
                  )}
                </a>
              ) : (
                <>
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="collab-logo" />
                  ) : (
                    <span className="collab-name">{c.name}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .collab-section {
          padding: 4rem 1.5rem;
          background: #f5f5f5;
          overflow: hidden;
        }
        .collab-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .collab-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }
        .collab-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #1a1a1a;
          margin: 0;
        }
        .collab-wrapper {
          overflow: hidden;
          width: 100%;
        }
        .collab-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          will-change: transform;
        }
        .collab-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 150px;
          height: 90px;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          transition: box-shadow 0.2s;
        }
        .collab-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .collab-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          text-decoration: none;
        }
        .collab-logo {
          max-height: 52px;
          max-width: 120px;
          object-fit: contain;
          filter: grayscale(1);
          opacity: 0.7;
          transition: filter 0.2s, opacity 0.2s;
        }
        .collab-item:hover .collab-logo {
          filter: grayscale(0);
          opacity: 1;
        }
        .collab-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #555;
          white-space: nowrap;
        }
      `}</style>
    </section>
  );
}