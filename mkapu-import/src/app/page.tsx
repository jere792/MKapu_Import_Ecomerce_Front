"use client";
import { useState } from "react";
import Link from "next/link";
import Carousel from "@/components/carousel";
import productsData from "@/data/products.json";

function byCategory(cat: string) {
  return (productsData as any[]).filter((p) => p.category === cat);
}

const featured = (productsData as any[]).filter((p) => p.featured);
const hornos = byCategory("horno");
const freidorasAire = byCategory("freidora-aire");
const maquinaHielo = byCategory("maquina-hielo");
const refrigeracion = byCategory("refrigeracion");

const ACCORDION_ITEMS = [
  {
    id: 1,
    title: "Máquinas de Hielo",
    emoji: "🧊",
    desc: "Producción continua 24h",
    imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939505/ebb81f5c-ffd5-40c8-9b4f-6b0de4dd9bd4.png",
    color: "#0ea5e9",
    category: "maquina-hielo",
  },
  {
    id: 2,
    title: "Refrigeración",
    emoji: "❄️",
    desc: "Cámaras y vitrinas frías",
    imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1767836605/587808323_18031172279761895_5030229700076669397_n_tvsdbk.png",
    color: "#6366f1",
    category: "refrigeracion",
  },
  {
    id: 3,
    title: "Cocina Profesional",
    emoji: "🍳",
    desc: "Hornos y equipos de alto rendimiento",
    imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939661/61bfa41c-d80e-41d6-9ffc-e0d11c75df37.png",
    color: "#e05c2a",
    category: "horno",
  },
  {
    id: 4,
    title: "Bebidas & Cafetería",
    emoji: "🥤",
    desc: "Máquinas de café y jugos",
    imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939690/2f1cc7f0-8adc-4b9f-8143-55c6c844851e.png",
    color: "#854d0e",
    category: "bebidas",
  },
  {
    id: 5,
    title: "Freidoras de Aire",
    emoji: "💨",
    desc: "Cocina saludable sin aceite",
    imageUrl: "https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939748/092b5987-d3c6-429a-a097-2e868a813145.png",
    color: "#16a34a",
    category: "freidora-aire",
  },
];

function HeroAccordion() {
  const [activeIdx, setActiveIdx] = useState(2);
  const active = ACCORDION_ITEMS[activeIdx];

  return (
    <section className="hacc">
      <div className="hacc__inner">
        <div className="hacc__text">
          <span className="hacc__eyebrow">Equipos de importación · Lima, Perú</span>
          <h1 className="hacc__title">
            Equipos que
            <br />
            <em style={{ color: active.color }}>{active.title}</em>
            <br />
            para tu negocio
          </h1>
          <p className="hacc__desc">
            {active.desc}. Directo del fabricante, con garantía y soporte técnico en Lima.
          </p>
          <div className="hacc__stats">
            {[["200+", "Productos"], ["5★", "Calificación"], ["24h", "Despacho Lima"]].map(([n, l]) => (
              <div key={l} className="hacc__stat">
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
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
                role="listitem"
                aria-label={item.title}
                style={{ "--panel-color": item.color } as React.CSSProperties}
              >
                <img src={item.imageUrl} alt={item.title} className="hacc__panel-img" loading="lazy" />
                <div className="hacc__panel-overlay" />
                <span className={`hacc__panel-label${isActive ? " hacc__panel-label--active" : ""}`}>
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
        .hacc__eyebrow { display:inline-block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#e05c2a; background:rgba(224,92,42,0.12); border:1px solid rgba(224,92,42,0.25); border-radius:99px; padding:4px 14px; margin-bottom:1.25rem; }
        .hacc__title { font-size:clamp(2rem,4.5vw,3.4rem); font-weight:900; line-height:1.1; letter-spacing:-0.035em; color:#fff; margin:0 0 1.1rem; }
        .hacc__title em { font-style:normal; transition:color 0.4s ease; }
        .hacc__desc { font-size:1rem; color:#999; line-height:1.65; margin:0 0 2rem; max-width:420px; }
        .hacc__stats { display:flex; gap:2rem; }
        .hacc__stat { display:flex; flex-direction:column; gap:2px; }
        .hacc__stat strong { font-size:1.4rem; font-weight:900; color:#fff; }
        .hacc__stat span { font-size:0.7rem; color:#555; text-transform:uppercase; letter-spacing:0.07em; }
        .hacc__accordion { display:flex; gap:10px; height:480px; align-items:stretch; }
        .hacc__panel { position:relative; border-radius:18px; overflow:hidden; cursor:pointer; flex:0 0 56px; transition:flex 0.6s cubic-bezier(0.4,0,0.2,1); }
        .hacc__panel--active { flex:1 1 0%; }
        .hacc__panel-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
        .hacc__panel:hover .hacc__panel-img { transform:scale(1.06); }
        .hacc__panel-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 60%,transparent 100%); }
        .hacc__panel:not(.hacc__panel--active) .hacc__panel-overlay { background:rgba(0,0,0,0.5); }
        .hacc__panel-label { position:absolute; bottom:20px; left:20px; display:flex; align-items:center; gap:8px; white-space:nowrap; }
        .hacc__panel-title { font-size:0.95rem; font-weight:800; color:#fff; text-shadow:0 1px 6px rgba(0,0,0,0.6); opacity:0; animation:fadeIn 0.3s 0.2s ease forwards; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .hacc__panel--active::after { content:""; position:absolute; inset:0; border-radius:18px; border:2px solid var(--panel-color,#e05c2a); opacity:0.6; pointer-events:none; }
        @media (max-width:900px) { .hacc__inner { grid-template-columns:1fr; gap:2.5rem; } .hacc__accordion { height:320px; } }
        @media (max-width:500px) { .hacc { padding:4rem 1rem 3rem; } .hacc__accordion { height:240px; gap:6px; } .hacc__panel { flex:0 0 38px; border-radius:12px; } .hacc__stats { gap:1.25rem; } }
      `}</style>
    </section>
  );
}

function CarouselSection({
  tag, title, subtitle, products, href, dark = false,
}: {
  tag?: string; title: string; subtitle?: string; products: any[]; href: string; dark?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className={`csec${dark ? " csec--dark" : ""}`}>
      <div className="csec__inner">
        <div className="csec__head">
          {tag && <span className="csec__tag">{tag}</span>}
          <h2 className="csec__title">{title}</h2>
          {subtitle && <p className="csec__sub">{subtitle}</p>}
        </div>
        <Carousel products={products} title="" />
        <div className="csec__foot">
          <Link href={href} className="csec__link">Ver todos →</Link>
        </div>
      </div>
      <style jsx>{`
        .csec { padding:4rem 1.5rem; background:#faf8f5; }
        .csec--dark { background:#111; }
        .csec__inner { max-width:1200px; margin:0 auto; }
        .csec__head { text-align:center; margin-bottom:2rem; }
        .csec__tag { display:inline-block; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#e05c2a; margin-bottom:0.5rem; }
        .csec__title { font-size:clamp(1.4rem,3vw,2rem); font-weight:900; letter-spacing:-0.02em; color:#1a1a1a; margin:0 0 0.5rem; }
        .csec--dark .csec__title { color:#fff; }
        .csec__sub { font-size:0.92rem; color:#777; max-width:480px; margin:0 auto; line-height:1.6; }
        .csec--dark .csec__sub { color:#888; }
        .csec__foot { text-align:center; margin-top:1.5rem; }
        .csec__link { font-size:0.88rem; font-weight:700; color:#e05c2a; text-decoration:none; border-bottom:2px solid transparent; transition:border-color 0.15s; }
        .csec__link:hover { border-color:#e05c2a; }
      `}</style>
    </section>
  );
}

const WHY_ITEMS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="1"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: "Directo del fabricante",
    desc: "Sin intermediarios. Precios competitivos con calidad de primera.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Soporte técnico local",
    desc: "Equipo en Lima para instalación, mantenimiento y garantía.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: "Despacho rápido",
    desc: "Entrega en Lima Metropolitana en 24–48 horas hábiles.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Asesoría personalizada",
    desc: "Te ayudamos a elegir el equipo ideal para tu negocio.",
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <HeroAccordion />

      <CarouselSection
        tag="Más vendidos"
        title="Productos destacados"
        subtitle="Los equipos más solicitados por restaurantes y hoteles de Lima."
        products={featured.length > 0 ? featured : (productsData as any[]).slice(0, 10)}
        href="/productos"
      />
      {/* Videos */}
      <section className="vid">
        <div className="vid__inner">
          <div className="vid__head">
            <span className="vid__tag">Conócenos</span>
            <h2 className="vid__title">Ve nuestros equipos en acción</h2>
            <p className="vid__sub">Mira cómo nuestras máquinas funcionan en entornos reales de trabajo.</p>
          </div>
          <div className="vid__row">
            <video className="vid__item" src="https://res.cloudinary.com/dxuk9bogw/video/upload/v1775778735/sssstik_M0s7GjQOyM_2026-04-09-18-51-58_t7gim9.mp4" controls playsInline preload="metadata" />
            <video className="vid__item" src="https://res.cloudinary.com/dxuk9bogw/video/upload/v1775778675/sssstik_qTDitLuabJ_2026-04-09-18-50-56_ourt9k.mp4" controls playsInline preload="metadata" />
          </div>
        </div>
      </section>

      <CarouselSection
        tag="Categoría"
        title="Hornos"
        subtitle="Hornos eléctricos y a gas para cocinas profesionales."
        products={hornos}
        href="/productos?cat=horno"
        dark
      />

      <CarouselSection
        tag="Tendencia"
        title="Freidoras de Aire"
        subtitle="Cocina saludable sin aceite. Todos nuestros productos con garantía de 60 días."
        products={freidorasAire}
        href="/productos?cat=freidora-aire"
      />

      <CarouselSection
        tag="Categoría"
        title="Máquinas de Hielo"
        subtitle="Producción continua 24h, potencia industrial, fácil mantenimiento."
        products={maquinaHielo}
        href="/productos?cat=maquina-hielo"
        dark
      />

      <CarouselSection
        tag="Categoría"
        title="Refrigeración"
        subtitle="Cámaras frías, vitrinas exhibidoras y equipos de conservación."
        products={refrigeracion}
        href="/productos?cat=refrigeracion"
      />

      {/* Por qué elegirnos */}
      <section className="why">
        <div className="why__inner">
          <div className="why__head">
            <span className="why__tag">¿Por qué elegirnos?</span>
            <h2 className="why__title">
              Importación directa,<br />
              <em>calidad garantizada</em>
            </h2>
          </div>
          <div className="why__grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="why__card">
                <div className="why__num">{item.num}</div>
                <div className="why__icon-wrap">{item.icon}</div>
                <h3 className="why__card-title">{item.title}</h3>
                <p className="why__card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Todos los estilos globales de HomePage en un solo bloque ── */}
      <style jsx>{`
        .home { overflow-x:hidden; }

        /* WHY */
        .why { background:#0d0d0d; padding:96px 40px; }
        .why__inner { max-width:1100px; margin:0 auto; }
        .why__head { margin-bottom:72px; }
        .why__tag { display:inline-block; font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#e05c2a; margin-bottom:16px; }
        .why__title { font-family:'Syne',sans-serif; font-size:clamp(32px,5vw,56px); font-weight:800; color:#fff; line-height:1.05; max-width:620px; }
        .why__title em { font-style:normal; color:#e05c2a; }
        .why__grid { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(255,255,255,0.08); border-radius:2px; }
        .why__card { padding:40px 32px; border-right:1px solid rgba(255,255,255,0.08); position:relative; overflow:hidden; transition:background 0.3s ease; }
        .why__card:last-child { border-right:none; }
        .why__card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:#e05c2a; transform:scaleX(0); transform-origin:left; transition:transform 0.35s cubic-bezier(0.4,0,0.2,1); }
        .why__card:hover { background:rgba(224,92,42,0.05); }
        .why__card:hover::before { transform:scaleX(1); }
        .why__num { font-family:'Syne',sans-serif; font-size:72px; font-weight:800; color:rgba(255,255,255,0.04); line-height:1; margin-bottom:-16px; letter-spacing:-4px; transition:color 0.3s ease; }
        .why__card:hover .why__num { color:rgba(224,92,42,0.12); }
        .why__icon-wrap { width:40px; height:40px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; }
        .why__icon-wrap :global(svg) { width:28px; height:28px; stroke:#e05c2a; fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
        .why__card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#fff; margin-bottom:12px; letter-spacing:-0.01em; }
        .why__card-desc { font-size:13.5px; color:rgba(255,255,255,0.45); line-height:1.65; }

        /* VIDEO */
        .vid { padding:4.5rem 1.5rem; background:#0f0f0f; }
        .vid__inner { max-width:780px; margin:0 auto; }
        .vid__head { text-align:center; margin-bottom:2rem; }
        .vid__tag { display:inline-block; font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#e05c2a; margin-bottom:0.6rem; }
        .vid__title { font-size:clamp(1.5rem,3vw,2.2rem); font-weight:900; letter-spacing:-0.02em; color:#fff; margin:0 0 0.5rem; }
        .vid__sub { font-size:0.92rem; color:#888; max-width:480px; margin:0 auto; line-height:1.6; }
        .vid__row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .vid__item { width:100%; border-radius:16px; display:block; background:#000; aspect-ratio:9/16; object-fit:cover; }

        @media (max-width:768px) {
          .why__grid { grid-template-columns:1fr 1fr; }
          .why__card { border-bottom:1px solid rgba(255,255,255,0.08); }
          .why__card:nth-child(2n) { border-right:none; }
        }
        @media (max-width:600px) {
          .vid__row { grid-template-columns:1fr; }
          .why { padding:64px 20px; }
        }
        @media (max-width:480px) {
          .why__grid { grid-template-columns:1fr; }
          .why__card { border-right:none; }
        }
      `}</style>
    </div>
  );
}