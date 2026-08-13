"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type QuienesSomosImagen = {
  id: number;
  url_imagen: string;
  orden: number;
};

type QuienesSomosSeccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  imagenes: QuienesSomosImagen[];
};

type Props = {
  secciones: QuienesSomosSeccion[];
  banner: BannerConfig | null;
};

function SeccionCarousel({ imagenes }: { imagenes: QuienesSomosImagen[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "20px",
          background: "#f2ece5",
          border: "1px solid #ece3d7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#b4aaa3",
        }}
      >
        <ImageOff size={48} />
        <span style={{ fontSize: "0.85rem" }}>Sin imágenes</span>
      </div>
    );
  }

  const hasMultiple = imagenes.length > 1;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%)",
          border: "1px solid #ece3d7",
        }}
      >
        <Image
          src={imagenes[activeIdx].url_imagen}
          alt=""
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        {hasMultiple && (
          <>
            <button
              onClick={() =>
                setActiveIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1))
              }
              aria-label="Anterior"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() =>
                setActiveIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1))
              }
              aria-label="Siguiente"
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              style={{
                aspectRatio: "1/1",
                borderRadius: "10px",
                overflow: "hidden",
                border: `2px solid ${i === activeIdx ? "#f5a623" : "#e8dfd3"}`,
                background: "#f9f6f2",
                cursor: "pointer",
                padding: 0,
                position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              <Image
                src={img.url_imagen}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuienesSomosClient({ secciones, banner }: Props) {
  const heroTitulo = banner?.titulo || "Quiénes Somos";
  const heroSub = banner?.subtitulo || "Importación directa desde fabricantes.";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <main className="bg-bg min-h-screen">
      {/* ── HERO ── */}
      <section className="relative w-full min-h-[320px] flex items-center justify-center bg-[#1a1a1a] overflow-hidden max-[520px]:min-h-[240px]">
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.6)_100%)] z-[1]" />
        <div className="relative z-[2] text-center px-6 pt-16 pb-14 max-w-[680px] max-[520px]:pt-12 max-[520px]:pb-10 max-[520px]:px-5">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase text-brand mb-3 px-4 py-[0.4rem] border border-[rgba(245,166,35,0.3)] rounded-full bg-[rgba(245,166,35,0.08)]">Sobre nosotros</span>
          <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-black text-white tracking-[-0.03em] mb-4 leading-[1.05]">{heroTitulo}</h1>
          <p className="text-[1.05rem] text-white/70 mx-auto leading-[1.7] max-w-[520px]">{heroSub}</p>
        </div>
      </section>

      {/* ── SECCIONES ZIGZAG ── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-[120px] flex flex-col gap-20 max-[1024px]:py-[60px] max-[1024px]:px-5 max-[1024px]:pb-20 max-[1024px]:gap-12 max-[520px]:px-3.5 max-[520px]:pt-10 max-[520px]:pb-[60px] max-[520px]:gap-8">
        {secciones.map((seccion, index) => {
          const isReverse = index % 2 !== 0;
          return (
            <section
              key={seccion.id}
              className={`grid grid-cols-2 gap-[60px] p-10 bg-white rounded-[28px] border border-[#ede8e1] shadow-[0_8px_32px_rgba(78,52,24,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_48px_rgba(78,52,24,0.1)] max-[1024px]:gap-10 max-[1024px]:p-8 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:p-7 max-[520px]:p-5 max-[520px]:gap-6 max-[520px]:rounded-[20px]`}
            >
              <div className={`flex flex-col gap-5 ${isReverse ? "order-2 max-[900px]:order-none" : ""}`}>
                {seccion.titulo && (
                  <div className="flex items-start gap-4 max-[520px]:gap-3">
                    <span className="text-[2.5rem] font-black text-brand leading-none shrink-0 opacity-60 tracking-[-0.04em] mt-0.5 max-[520px]:text-[2rem]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-[clamp(1.4rem,2.2vw,1.9rem)] font-extrabold leading-[1.2] text-[#1f1a17]">{seccion.titulo}</h2>
                  </div>
                )}
                {seccion.descripcion && (
                  <div
                    className="text-base leading-[1.8] text-[#5c5249] [&_p]:mb-4 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: seccion.descripcion }}
                  />
                )}
              </div>

              <div className={`w-full ${isReverse ? "order-1 max-[900px]:order-none" : ""}`}>
                <SeccionCarousel imagenes={seccion.imagenes} />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
