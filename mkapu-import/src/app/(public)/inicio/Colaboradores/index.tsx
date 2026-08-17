"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Colaborador,
  getColaboradoresWithMedia,
  ColaboradorWithMedia,
} from "@/lib/queries";

import {
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  ImageIcon,
  Film,
} from "lucide-react";

type MediaItem = {
  id: number;
  url: string;
  tipo: string;
  titulo: string | null;
  orden: number;
};

const SCROLL_THRESHOLD = 5;

// ── MODAL ──────────────────────────────────────────────────────────────────
function MediaModal({
  colaborador,
  media,
  onClose,
}: {
  colaborador: Colaborador & { media?: MediaItem[] };
  media: MediaItem[];
  onClose: () => void;
}) {
  const imagenes = media.filter((m) => m.tipo === "imagen");
  const videos = media.filter((m) => m.tipo === "video");
  const [tab, setTab] = useState<"fotos" | "videos">(
    imagenes.length > 0 ? "fotos" : "videos",
  );
  const [activeIdx, setActiveIdx] = useState(0);

  const items = tab === "fotos" ? imagenes : videos;

  function prev() {
    setActiveIdx((i) => (i === 0 ? items.length - 1 : i - 1));
  }

  function next() {
    setActiveIdx((i) => (i === items.length - 1 ? 0 : i + 1));
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, activeIdx, tab]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function switchTab(t: "fotos" | "videos") {
    setTab(t);
    setActiveIdx(0);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "1.1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0ebe4",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {colaborador.logo_url && (
              <div
                style={{
                  position: "relative",
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #f0ebe4",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={colaborador.logo_url}
                  alt={colaborador.name}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.65rem",
                  color: "#f5a623",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Colaborador
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  color: "#1a1a1a",
                }}
              >
                {colaborador.name}
              </h3>
            </div>
          </div>

          {imagenes.length > 0 && videos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                background: "#f5f0ea",
                borderRadius: "12px",
                padding: "4px",
              }}
            >
              <button
                onClick={() => switchTab("fotos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "9px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: tab === "fotos" ? "#f5a623" : "transparent",
                  color: tab === "fotos" ? "#fff" : "#888",
                  transition: "all 0.18s",
                }}
              >
                <ImageIcon size={14} />
                Fotos
                <span
                  style={{
                    background:
                      tab === "fotos" ? "rgba(255,255,255,0.3)" : "#e0d8d0",
                    color: tab === "fotos" ? "#fff" : "#999",
                    borderRadius: "99px",
                    padding: "1px 7px",
                    fontSize: "0.7rem",
                  }}
                >
                  {imagenes.length}
                </span>
              </button>

              <button
                onClick={() => switchTab("videos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "9px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: tab === "videos" ? "#f5a623" : "transparent",
                  color: tab === "videos" ? "#fff" : "#888",
                  transition: "all 0.18s",
                }}
              >
                <Film size={14} />
                Videos
                <span
                  style={{
                    background:
                      tab === "videos" ? "rgba(255,255,255,0.3)" : "#e0d8d0",
                    color: tab === "videos" ? "#fff" : "#999",
                    borderRadius: "99px",
                    padding: "1px 7px",
                    fontSize: "0.7rem",
                  }}
                >
                  {videos.length}
                </span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              background: "#f5f0ea",
              border: "none",
              borderRadius: "10px",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#666",
              transition: "background 0.15s",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
            background: "#fafaf9",
          }}
        >
          {tab === "fotos" && (
            <div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#111",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                >
                  <Image
                    src={items[activeIdx]?.url ?? ""}
                    alt={items[activeIdx]?.titulo ?? ""}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="900px"
                  />
                </div>

                {items.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      style={{
                        position: "absolute",
                        left: -20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "none",
                        background: "#fff",
                        color: "#1a1a1a",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
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
                      onClick={next}
                      style={{
                        position: "absolute",
                        right: -20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "none",
                        background: "#fff",
                        color: "#1a1a1a",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
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

              {items.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "16px",
                  }}
                >
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: i === activeIdx ? 24 : 8,
                        height: 8,
                        borderRadius: "99px",
                        border: "none",
                        background: i === activeIdx ? "#f5a623" : "#d9d0c7",
                        cursor: "pointer",
                        padding: 0,
                        transition: "width 0.2s, background 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}

              {items.length > 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  {items.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: `2.5px solid ${i === activeIdx ? "#f5a623" : "transparent"}`,
                        padding: 0,
                        cursor: "pointer",
                        position: "relative",
                        background: "#eee",
                        transition: "border-color 0.15s",
                        boxShadow:
                          i === activeIdx
                            ? "0 0 0 3px rgba(245,166,35,0.2)"
                            : "none",
                      }}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="90px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {items[activeIdx]?.titulo && (
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "0.85rem",
                    color: "#888",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  {items[activeIdx].titulo}
                </p>
              )}
            </div>
          )}

          {tab === "videos" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {videos.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #f0ebe4",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  {v.titulo && (
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f5f0ea",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Film size={15} color="#f5a623" />
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "#1a1a1a",
                        }}
                      >
                        {v.titulo}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: 0 }}>
                    <video
                      src={v.url}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "480px",
                        display: "block",
                        background: "#000",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CARD ───────────────────────────────────────────────────────────────────
function ColabCard({
  colaborador,
  onOpen,
}: {
  colaborador: Colaborador & { media?: MediaItem[] };
  onOpen: () => void;
}) {
  const media = colaborador.media ?? [];
  const nFotos = media.filter((m) => m.tipo === "imagen").length;
  const nVideos = media.filter((m) => m.tipo === "video").length;
  const hasMedia = nFotos > 0 || nVideos > 0;

  const cardContent = (
    <>
      <div className="w-full h-[175px] flex items-center justify-center px-[26px] py-5 bg-white max-sm:h-[130px] max-sm:px-[18px] max-sm:py-4">
        {colaborador.logo_url ? (
          <div className="w-[140px] h-20 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={colaborador.logo_url}
              alt={colaborador.name}
              className="w-full h-full object-cover object-center block transition-transform duration-200 max-sm:w-[110px] max-sm:h-[46px]"
              loading="lazy"
            />
          </div>
        ) : (
          <span className="text-[0.95rem] font-extrabold text-ink text-center">{colaborador.name}</span>
        )}
      </div>

      <div className="border-t border-[#f0ebe4] px-3 py-2 flex items-center justify-between gap-1.5 min-h-[42px]">
        <span className="text-[0.72rem] font-bold text-[#666] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] max-sm:max-w-[82px]">{colaborador.name}</span>

        {hasMedia && (
          <div className="flex items-center gap-1 shrink-0">
            {nFotos > 0 && (
              <span className="flex items-center gap-0.5 text-[0.58rem] font-bold rounded-full px-1.5 py-0.5 bg-[#f0ebe4] text-[#666]">
                <ImageIcon size={8} /> {nFotos}
              </span>
            )}
            {nVideos > 0 && (
              <span className="flex items-center gap-0.5 text-[0.58rem] font-bold rounded-full px-1.5 py-0.5 bg-[#fff3d6] text-[#c47a00]">
                <Film size={8} /> {nVideos}
              </span>
            )}
          </div>
        )}
      </div>

      {hasMedia && (
        <div className="bg-brand py-[7px] text-center flex items-center justify-center gap-[5px]">
          <Images size={12} color="#fff" />
          <span className="text-[0.68rem] font-extrabold text-white tracking-[0.04em] uppercase">Ver galería</span>
        </div>
      )}
    </>
  );

  return (
    <div
      className="flex flex-col justify-start items-stretch min-w-[220px] bg-white border border-[#e8e8e8] rounded-[14px] overflow-hidden transition-[box-shadow,border-color,transform] duration-200 shrink-0 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-brand max-sm:min-w-[160px]"
      onClick={hasMedia ? onOpen : undefined}
      style={{ cursor: hasMedia ? "pointer" : "default" }}
    >
      {colaborador.url && !hasMedia ? (
        <a
          href={colaborador.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col no-underline text-inherit h-full"
        >
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </div>
  );
}

// ── CAROUSEL ───────────────────────────────────────────────────────────────
export default function CollaboratorsCarousel() {
  const [colaboradores, setColaboradores] = useState<
    (ColaboradorWithMedia & { media?: MediaItem[] })[]
  >([]);
  const [modalCollab, setModalCollab] = useState<
    (ColaboradorWithMedia & { media?: MediaItem[] }) | null
  >(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getColaboradoresWithMedia().then((data) => {
      const mapped = data.map((c) => ({
        ...c,
        media: c.colaborador_media as MediaItem[],
      }));
      setColaboradores(mapped);
    });
  }, []);

  const shouldScroll = colaboradores.length > SCROLL_THRESHOLD;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || colaboradores.length === 0 || !shouldScroll) return;

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
  }, [colaboradores, shouldScroll]);

  if (colaboradores.length === 0) return null;

  const items = shouldScroll
    ? [...colaboradores, ...colaboradores]
    : colaboradores;

  return (
    <>
      <section className="py-20 px-6 bg-[#f5f5f5] overflow-hidden max-sm:py-12 max-sm:px-4">
        <div className="max-w-[1400px] mx-auto text-center mb-10">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">Colaboraciones</span>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-ink m-0">Con quienes hemos trabajado</h2>
        </div>

        <div
          className={`overflow-hidden w-full${shouldScroll ? " relative" : ""}`}
        >
          {shouldScroll && (
            <>
              <div className="absolute top-0 bottom-0 w-[100px] z-[2] pointer-events-none left-0 bg-gradient-to-r from-[#f5f5f5] from-30% to-transparent max-sm:w-[60px]" />
              <div className="absolute top-0 bottom-0 w-[100px] z-[2] pointer-events-none right-0 bg-gradient-to-l from-[#f5f5f5] from-30% to-transparent max-sm:w-[60px]" />
            </>
          )}

          <div
            className={`flex gap-8 w-max will-change-transform items-stretch${!shouldScroll ? " w-full! justify-center flex-wrap gap-6 max-sm:gap-4" : ""}`}
            ref={trackRef}
          >
            {items.map((c, i) => (
              <ColabCard
                key={`${c.id}-${i}`}
                colaborador={c}
                onOpen={() => {
                  const original = colaboradores.find((x) => x.id === c.id)!;
                  setModalCollab(original);
                }}
              />
            ))}
          </div>
        </div>

      </section>

      {modalCollab && (
        <MediaModal
          colaborador={modalCollab}
          media={modalCollab.media ?? []}
          onClose={() => setModalCollab(null)}
        />
      )}
    </>
  );
}
