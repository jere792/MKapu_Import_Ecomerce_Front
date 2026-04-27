"use client";

import { useState } from "react";

const ACCORDION_ITEMS = [
  { id: 1, title: "Máquinas de Hielo", desc: "Producción continua 24h", imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939505/ebb81f5c-ffd5-40c8-9b4f-6b0de4dd9bd4.png", color: "#0ea5e9" },
  { id: 2, title: "Refrigeración", desc: "Cámaras y vitrinas frías", imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1767836605/587808323_18031172279761895_5030229700076669397_n_tvsdbk.png", color: "#6366f1" },
  { id: 3, title: "Cocina Profesional", desc: "Hornos y equipos de alto rendimiento", imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939661/61bfa41c-d80e-41d6-9ffc-e0d11c75df37.png", color: "#e05c2a" },
  { id: 4, title: "Bebidas & Cafetería", desc: "Máquinas de café y jugos", imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939690/2f1cc7f0-8adc-4b9f-8143-55c6c844851e.png", color: "#854d0e" },
  { id: 5, title: "Freidoras de Aire", desc: "Cocina saludable sin aceite", imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939748/092b5987-d3c6-429a-a097-2e868a813145.png", color: "#16a34a" },
];

export default function HeroAccordion() {
  const [activeIdx, setActiveIdx] = useState(2);
  const active = ACCORDION_ITEMS[activeIdx];

  return (
    <section className="hacc">
      <div className="hacc__inner">
        <div className="hacc__text">
          <span className="hacc__eyebrow">Equipos de importación · Lima, Perú</span>
          <h1 className="hacc__title">
            Equipos que<br />
            <em style={{ color: active.color }}>{active.title}</em><br />
            para tu negocio
          </h1>
          <p className="hacc__desc">{active.desc}. Directo del fabricante, con garantía y soporte técnico en Lima.</p>
        </div>

        {/* ── Desktop: acordeón horizontal ── */}
        <div className="hacc__accordion hacc__accordion--desktop" role="list">
          {ACCORDION_ITEMS.map((item, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={item.id}
                className={`hacc__panel${isActive ? " hacc__panel--active" : ""}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                onTouchStart={() => setActiveIdx(idx)}
                role="listitem"
                aria-label={item.title}
                style={{ ["--panel-color" as any]: item.color }}
              >
                <img src={item.imageUrl} alt={item.title} className="hacc__panel-img" loading="lazy" />
                <div className="hacc__panel-overlay" />
                <span className="hacc__panel-label">
                  {isActive && <span className="hacc__panel-title">{item.title}</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: tabs + imagen grande ── */}
        <div className="hacc__mobile">
          <div className="hacc__tabs">
            {ACCORDION_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                className={`hacc__tab${idx === activeIdx ? " hacc__tab--active" : ""}`}
                onClick={() => setActiveIdx(idx)}
                style={{ ["--tab-color" as any]: item.color }}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="hacc__bigimg-wrap">
            <img
              src={active.imageUrl}
              alt={active.title}
              className="hacc__bigimg"
            />
            <div className="hacc__panel-overlay" />
            <span className="hacc__bigimg-label">{active.title}</span>
          </div>
        </div>
      </div>

    </section>
  );
}