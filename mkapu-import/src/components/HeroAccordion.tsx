"use client";

import { useState } from "react";

type Banner = {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string | null;
  eyebrow: string | null;
  titulo_completo: string | null;
  image_url: string;
  link_url: string;
  orden: number;
  activo: boolean;
};

const COLORS = ["#0ea5e9", "#6366f1", "#e05c2a", "#854d0e", "#16a34a"];

export default function HeroAccordion({ initialBanners }: { initialBanners: Banner[] }) {
  const [items] = useState<Banner[]>(initialBanners);
  const [activeIdx, setActiveIdx] = useState(Math.min(2, initialBanners.length - 1));

  if (items.length === 0) return (
    <section className="bg-[#0c0c0c] pt-20 pb-16 px-6 overflow-hidden">
      <div style={{ minHeight: "560px" }} />
    </section>
  );

  const active = items[activeIdx];
  const activeColor = COLORS[activeIdx % COLORS.length];

  return (
    <section className="bg-[#0c0c0c] pt-20 pb-16 px-6 max-[500px]:px-4 max-[500px]:pt-16 max-[500px]:pb-12 overflow-hidden">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 gap-8 items-center min-[901px]:grid-cols-2 min-[901px]:gap-12">
        <div>
          <span className="inline-block text-[0.72rem] font-bold tracking-[0.12em] uppercase text-brand bg-[rgba(224,92,42,0.12)] border border-[rgba(224,92,42,0.25)] rounded-full px-3.5 py-1 mb-5">
            {active.eyebrow || "Equipos de importación · Lima, Perú"}
          </span>
          {active.titulo_completo ? (
            <h1
              className="text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-[1.1] tracking-[-0.035em] text-white mb-[1.1rem] [&_em]:not-italic"
              dangerouslySetInnerHTML={{ __html: active.titulo_completo }}
            />
          ) : (
            <h1 className="text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-[1.1] tracking-[-0.035em] text-white mb-[1.1rem] [&_em]:not-italic">
              Equipos que
              <br />
              <em style={{ color: activeColor }}>{active.titulo}</em>
              <br />
              para tu negocio
            </h1>
          )}
          <p className="text-base text-[#999] leading-relaxed max-w-[420px]">
            {active.descripcion || `${active.subtitulo}. Directo del fabricante, con garantía y soporte técnico en Lima.`}
          </p>
        </div>

        {/* ── Desktop: acordeón horizontal ── */}
        <div className="hidden md:flex gap-2.5 items-stretch h-[480px] max-[900px]:h-[320px] max-[500px]:h-[240px]" role="list">
          {items.map((item, idx) => {
            const isActive = idx === activeIdx;
            const color = COLORS[idx % COLORS.length];
            return (
              <div
                key={item.id}
                className={`group relative rounded-[18px] overflow-hidden cursor-pointer flex-[0_0_56px] transition-[flex] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] max-[500px]:flex-[0_0_38px] max-[500px]:rounded-[12px] ${
                  isActive
                    ? "flex-[1_1_0%] after:content-[''] after:absolute after:inset-0 after:rounded-[18px] after:border-2 after:border-[var(--panel-color,#f5a623)] after:opacity-60 after:pointer-events-none"
                    : ""
                }`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                onTouchStart={() => setActiveIdx(idx)}
                role="listitem"
                aria-label={item.titulo}
                style={{ ["--panel-color" as any]: color }}
              >
                <img
                  src={item.image_url}
                  alt={item.titulo}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 ${
                    isActive
                      ? "bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.1)_60%,transparent_100%)]"
                      : "bg-black/50"
                  }`}
                />
                <span className="absolute bottom-5 left-5 flex items-center gap-2 whitespace-nowrap">
                  {isActive && (
                    <span className="text-[0.95rem] font-extrabold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_0.2s_ease_forwards]">
                      {item.titulo}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: tabs + imagen grande ── */}
        <div className="md:hidden">
          <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                className={`bg-white/7 border border-white/12 rounded-full text-[#ccc] text-[0.75rem] font-bold px-3.5 py-1.5 cursor-pointer transition-colors ${
                  idx === activeIdx ? "bg-[var(--tab-color)] border-[var(--tab-color)] text-white" : ""
                }`}
                onClick={() => setActiveIdx(idx)}
                style={{ ["--tab-color" as any]: COLORS[idx % COLORS.length] }}
              >
                {item.titulo}
              </button>
            ))}
          </div>
          <div className="relative w-full h-[260px] rounded-[18px] overflow-hidden">
            <img
              src={active.image_url}
              alt={active.titulo}
              className="w-full h-full object-cover block"
              fetchPriority="high"
              decoding="async"
              loading="eager"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.1)_60%,transparent_100%)]" />
            <span className="absolute bottom-4 left-[18px] text-[1.1rem] font-extrabold text-white">
              {active.titulo}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}