"use client";

import { useEffect, useRef, useState } from "react";
import { getMarcas, Marca } from "@/lib/queries";

const SCROLL_THRESHOLD = 5;

export default function BrandsCarousel() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMarcas().then(setMarcas);
  }, []);

  const shouldScroll = marcas.length > SCROLL_THRESHOLD;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || marcas.length === 0 || !shouldScroll) return;

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
  }, [marcas, shouldScroll]);

  if (marcas.length === 0) return <section style={{ minHeight: "280px" }} />;

  const items = shouldScroll ? [...marcas, ...marcas] : marcas;

  return (
    <section className="py-20 px-6 bg-white overflow-hidden max-sm:py-12 max-sm:px-4">
      <div className="max-w-[1400px] mx-auto text-center mb-10">
        <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">Nuestras Marcas</span>
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-ink m-0">Marcas que distribuimos</h2>
      </div>

      <div
        className={`w-full overflow-hidden ${shouldScroll ? "relative" : ""}`}
      >
        {shouldScroll && (
          <>
            <div className="absolute top-0 bottom-0 w-[100px] z-[2] pointer-events-none left-0 bg-gradient-to-r from-white from-30% to-transparent max-sm:w-[60px]" />
            <div className="absolute top-0 bottom-0 w-[100px] z-[2] pointer-events-none right-0 bg-gradient-to-l from-white from-30% to-transparent max-sm:w-[60px]" />
          </>
        )}

        <div
          className={`flex gap-8 w-max will-change-transform ${!shouldScroll ? "w-full! justify-center flex-wrap gap-6 max-sm:gap-4" : ""}`}
          ref={trackRef}
        >
          {items.map((m, i) => (
            <div key={`${m.id}-${i}`} className="group flex items-center justify-center min-w-[140px] h-20 bg-[#f9f9f9] border border-[#efefef] rounded-xl px-6 py-4 transition-[box-shadow,border-color] duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-brand max-sm:min-w-[110px] max-sm:h-16 max-sm:px-4 max-sm:py-3">
              {m.logo_url ? (
                <img
                  src={m.logo_url}
                  alt={m.name}
                  className="max-h-12 max-w-[110px] object-contain grayscale opacity-70 transition-[filter,opacity] duration-200 group-hover:grayscale-0 group-hover:opacity-100 max-sm:max-h-9 max-sm:max-w-[85px]"
                  loading="lazy"
                />
              ) : (
                <span className="text-[0.9rem] font-bold text-[#555] whitespace-nowrap">{m.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}