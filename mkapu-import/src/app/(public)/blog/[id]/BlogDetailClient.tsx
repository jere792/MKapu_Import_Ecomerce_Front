"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  ImageOff,
} from "lucide-react";

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  fecha_publicacion: string;
};

type BlogImagen = {
  id: number;
  url_imagen: string;
  orden: number;
};

type BlogVideo = {
  id: number;
  video_url: string;
  titulo: string | null;
  orden: number;
};

type Props = {
  post: BlogPost;
  imagenes: BlogImagen[];
  videos: BlogVideo[];
};

export default function BlogDetailClient({ post, imagenes, videos }: Props) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const allMedia = [
    ...imagenes.map((img) => ({
      type: "image" as const,
      url: img.url_imagen,
      titulo: null,
    })),
    ...videos.map((vid) => ({
      type: "video" as const,
      url: vid.video_url,
      titulo: vid.titulo,
    })),
  ];

  const currentMedia = allMedia[activeMediaIdx];
  const hasMultipleMedia = allMedia.length > 1;

  function prevMedia() {
    setActiveMediaIdx((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  }

  function nextMedia() {
    setActiveMediaIdx((i) => (i === allMedia.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="max-w-[900px] mx-auto px-5 pt-10 pb-20 max-[768px]:px-3.5 max-[768px]:pt-6 max-[768px]:pb-[60px]">
      <div className="mb-8">
        <Link href="/blog" className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#e6dccf] bg-white text-[#4d5b67] text-[0.9rem] font-semibold transition-all duration-200 hover:border-[#e05c2a] hover:text-[#e05c2a] hover:-translate-x-1 max-[520px]:text-[0.85rem] max-[520px]:px-3.5 max-[520px]:py-2">
          <ArrowLeft size={18} />
          <span>Volver al blog</span>
        </Link>
      </div>

      <article className="bg-white rounded-3xl p-12 border border-[#ece3d7] shadow-[0_20px_50px_rgba(78,52,24,0.08)] max-[768px]:p-7 max-[768px]:rounded-[20px] max-[520px]:px-4 max-[520px]:py-5">
        <header className="mb-10 max-[768px]:mb-7">
          <div className="flex items-center gap-2 text-[0.9rem] text-[#95877d] font-semibold mb-4">
            <Calendar size={16} />
            <span>
              {new Date(post.fecha_publicacion).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] mb-5 text-[#1f1a17]">{post.titulo}</h1>
          <p className="text-[1.15rem] text-[#72675f] leading-[1.7]">{post.descripcion}</p>
        </header>

        {allMedia.length > 0 && (
          <div className="my-10 max-[768px]:my-7">
            <div className="relative aspect-[16/10] rounded-[20px] overflow-hidden bg-[linear-gradient(135deg,#fff7ef_0%,#f2ece5_100%)] border border-[#ece3d7]">
              {currentMedia && currentMedia.url ? (
                currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    className="w-full h-full object-cover block"
                    key={currentMedia.url}
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={post.titulo}
                    className="w-full h-full object-cover block"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#b4aaa3]">
                  <ImageOff size={48} />
                  <span>Medio no disponible</span>
                </div>
              )}

              {hasMultipleMedia && (
                <>
                  <button
                    className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 rounded-full border-none bg-white/95 text-[#1a1a1a] flex items-center justify-center cursor-pointer z-[2] transition-all duration-200 hover:bg-white hover:scale-110"
                    onClick={prevMedia}
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 rounded-full border-none bg-white/95 text-[#1a1a1a] flex items-center justify-center cursor-pointer z-[2] transition-all duration-200 hover:bg-white hover:scale-110"
                    onClick={nextMedia}
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleMedia && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 mt-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(60px,1fr))]">
                {allMedia.map((media, i) => (
                  <button
                    key={i}
                    className={`aspect-square rounded-xl overflow-hidden border-2 border-[#e8dfd3] bg-[#f9f6f2] cursor-pointer p-0 transition-all duration-200 hover:scale-105 hover:border-[#d7c6b0] ${i === activeMediaIdx ? "border-[#e05c2a]" : ""}`}
                    onClick={() => setActiveMediaIdx(i)}
                  >
                    {media.type === "video" ? (
                        media.url ? (
                          <div className="w-full h-full relative">
                            <video
                              src={media.url}
                              muted
                              preload="metadata"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                              <Play size={20} color="#fff" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#b4aaa3]">
                            <ImageOff size={14} />
                          </div>
                        )
                      ) : media.url ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover block" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#b4aaa3]">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="text-[1.05rem] leading-[1.8] text-[#1f1a17] [&_h2]:text-[1.8rem] [&_h2]:font-extrabold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[1.4rem] [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-2"
          dangerouslySetInnerHTML={{ __html: post.contenido }}
        />
      </article>

    </div>
  );
}