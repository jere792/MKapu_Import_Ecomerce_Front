"use client";
import { useEffect, useRef, useState } from "react";
import { getVideos, Video } from "@/lib/queries";

// ── Detecta el tipo de fuente ──────────────────────────────────────────────
type VideoSource =
  | { type: "youtube"; id: string }
  | { type: "tiktok"; url: string }
  | { type: "direct"; url: string }
  | { type: "none" };

function detectSource(video: Video): VideoSource {
  if (video.youtube_id?.trim()) {
    return { type: "youtube", id: video.youtube_id.trim() };
  }
  const url = video.video_url?.trim();
  if (!url) return { type: "none" };
  if (url.includes("tiktok.com")) return { type: "tiktok", url };
  return { type: "direct", url };
}

// ── Player universal ───────────────────────────────────────────────────────
function VideoPlayer({ video }: { video: Video }) {
  const [embedError, setEmbedError] = useState(false);
  const source = detectSource(video);

  useEffect(() => { setEmbedError(false); }, [video.id]);

  if (source.type === "none" || embedError) {
    return (
      <div className="w-full aspect-video bg-[#111] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4 p-6">
          <p className="text-[#aaa] text-[0.9rem] m-0">⚠️ No hay video disponible</p>
        </div>
      </div>
    );
  }

  if (source.type === "youtube") {
    return (
      <iframe
        key={source.id}
        src={`https://www.youtube.com/embed/${source.id}?rel=0`}
        title={video.title}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="w-full aspect-video border-0 block"
        onError={() => setEmbedError(true)}
      />
    );
  }

  if (source.type === "tiktok") {
    const match = source.url.match(/video\/(\d+)/);
    const tiktokId = match?.[1];

    if (!tiktokId) return (
      <div className="w-full aspect-video bg-[#111] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4 p-6">
          <p className="text-[#aaa] text-[0.9rem] m-0">URL de TikTok no válida</p>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="bg-brand text-black font-bold text-sm px-6 py-2.5 rounded-lg no-underline hover:bg-[#e69510]">
            Ver en TikTok
          </a>
        </div>
      </div>
    );

    return (
      <div className="w-full flex justify-center bg-[#111] py-4">
        <iframe
          key={tiktokId}
          src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
          title={video.title}
          allowFullScreen
          allow="encrypted-media"
          className="w-[325px] h-[580px] border-0 rounded-xl max-md:w-full max-md:max-w-[325px]"
          onError={() => setEmbedError(true)}
        />
      </div>
    );
  }

  if (source.type === "direct") {
    return (
      <video
        key={source.url}
        src={source.url}
        controls
        className="w-full aspect-video border-0 block"
        onError={() => setEmbedError(true)}
      />
    );
  }

  return null;
}

// ── Componente principal ───────────────────────────────────────────────────
export default function VideoSection({ tipo }: { tipo?: "video" | "vlog" }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    getVideos(tipo).then((data) => {
      setVideos(data);
      if (data.length > 0) setActive(data[0]);
    });
  }, [tipo]);

  if (videos.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">{tipo === "vlog" ? "Vlog" : "Videos"}</span>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-white m-0">
            {tipo === "vlog" ? "Nuestro Vlog" : "Videos destacados"}
          </h2>
        </div>

        <div className="grid grid-cols-[minmax(0,680px)_280px] gap-6 items-start justify-center max-md:grid-cols-1">
          <div className="bg-[#111] rounded-xl overflow-hidden">
            {active && <VideoPlayer video={active} />}
          </div>

          <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#333_transparent] max-md:max-h-[300px]">
            {videos.map((v) => {
              const src = detectSource(v);
              const thumbSrc =
                v.thumbnail ||
                (src.type === "youtube"
                  ? `https://img.youtube.com/vi/${src.id}/mqdefault.jpg`
                  : null);

              const badge =
                src.type === "youtube" ? "YT" :
                src.type === "tiktok"  ? "TK" :
                src.type === "direct"  ? "📁" : "";

              return (
                <button
                  key={v.id}
                  onClick={() => setActive(v)}
                  className={`flex gap-3 bg-[#111] border-[1.5px] border-transparent rounded-[10px] p-[0.6rem] cursor-pointer text-left transition-[border-color,background] duration-150 hover:bg-[#1a1a1a]${active?.id === v.id ? " border-brand bg-[#1a1a1a]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-semibold text-white mb-1 leading-[1.3] line-clamp-2">{v.title}</p>
                    {v.descripcion && (
                      <p className="text-[0.75rem] text-[#666] m-0 whitespace-nowrap overflow-hidden text-ellipsis">{v.descripcion}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}