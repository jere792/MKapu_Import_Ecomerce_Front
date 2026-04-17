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

        <div className="hacc__accordion" role="list">
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
      </div>

      <style jsx>{`
        .hacc { background:#0c0c0c; padding:5rem 1.5rem 4rem; overflow:hidden; }
        .hacc__inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
        .hacc__eyebrow { display:inline-block; font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#f5a623; background:rgba(224,92,42,.12); border:1px solid rgba(224,92,42,.25); border-radius:99px; padding:4px 14px; margin-bottom:1.25rem; }
        .hacc__title { font-size:clamp(2rem,4.5vw,3.4rem); font-weight:900; line-height:1.1; letter-spacing:-.035em; color:#fff; margin:0 0 1.1rem; }
        .hacc__desc { font-size:1rem; color:#999; line-height:1.65; margin:0; max-width:420px; }
        .hacc__accordion { display:flex; gap:10px; height:480px; align-items:stretch; }
        .hacc__panel { position:relative; border-radius:18px; overflow:hidden; cursor:pointer; flex:0 0 56px; transition:flex .6s cubic-bezier(.4,0,.2,1); }
        .hacc__panel--active { flex:1 1 0%; }
        .hacc__panel-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .hacc__panel-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 60%,transparent 100%); }
        .hacc__panel-label { position:absolute; bottom:20px; left:20px; }
        .hacc__panel-title { font-size:.95rem; font-weight:800; color:#fff; }
      `}</style>
    </section>
  );
}