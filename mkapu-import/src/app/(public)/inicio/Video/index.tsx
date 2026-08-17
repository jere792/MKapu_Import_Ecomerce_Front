"use client";
import { useEffect, useState } from "react";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
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

type SourceType = "youtube" | "tiktok" | "direct" | null;

function sourceType(video: Video): SourceType {
  const src = detectSource(video);
  if (src.type === "youtube") return "youtube";
  if (src.type === "tiktok") return "tiktok";
  if (src.type === "direct") return "direct";
  return null;
}

function videoThumb(video: Video): string | null {
  if (video.thumbnail?.trim()) return video.thumbnail.trim();
  const src = detectSource(video);
  if (src.type === "youtube") return `https://img.youtube.com/vi/${src.id}/mqdefault.jpg`;
  return null;
}

// ── Íconos de fuente (SVG inline, como en el diseño Stitch) ────────────────
function YoutubeIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.6,15.4V8.6l6.4,3.4L9.6,15.4z" />
    </svg>
  );
}

function TiktokIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  );
}

// ── Imagen con skeleton shimmer mientras carga ─────────────────────────────
function SkeletonImage({
  src,
  alt,
  imgClassName = "",
  wrapperClassName = "",
}: {
  src: string;
  alt: string;
  imgClassName?: string;
  wrapperClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#171717_25%,#242424_50%,#171717_75%)] bg-[length:200%_100%] animate-[skShimmer_1.4s_ease-in-out_infinite]" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
      />
    </div>
  );
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
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getVideos(tipo).then((data) => {
      setVideos(data);
      if (data.length > 0) setActive(data[0]);
    });
  }, [tipo]);

  function selectVideo(v: Video) {
    setActive(v);
    setPlaying(true);
  }

  if (videos.length === 0 || !active) return null;

  const badge = sourceType(active);
  const thumb = videoThumb(active);

  return (
    <section className="py-20 px-6 bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">
            {tipo === "vlog" ? "Vlog" : "Videos"}
          </span>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-white m-0">
            {tipo === "vlog" ? "Nuestro Vlog" : "Videos destacados"}
          </h2>
        </div>

        {playing && (
          <div key={active.id} className="lg:w-[calc(70%-1.4rem)] mb-6 lg:mb-8 animate-[fadeInUp_0.5s_ease-out]">
            <span className="inline-flex items-center gap-2 text-brand text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
              <span className="w-8 h-px bg-brand" />
              Reproduciendo ahora
            </span>
            <h3 className="text-[32px] md:text-[44px] font-black text-white leading-[1.05]">
              {active.title}
            </h3>
            {active.descripcion && (
              <p className="text-[1.05rem] text-[#c9c9c9] mt-4 max-w-3xl leading-relaxed border-l-2 border-brand pl-4">
                {active.descripcion}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8">
          <div className="min-w-0">
            <div className="relative w-full bg-[#151515] rounded-[20px] border border-[#2a2a2a] shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden group">
              {!playing ? (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Reproducir videos"
                  className="relative w-full aspect-video block cursor-pointer overflow-hidden group bg-[#101010]"
                >
                  {thumb && (
                    <SkeletonImage
                      src={thumb}
                      alt=""
                      wrapperClassName="absolute inset-0"
                      imgClassName="group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">
                    <span className="text-brand text-[11px] font-bold tracking-[0.25em] uppercase">
                      Videos destacados
                    </span>
                    <h3 className="text-white text-[clamp(1.6rem,4vw,2.6rem)] font-black leading-tight max-w-2xl">
                      Mira nuestras <span className="text-brand">colecciones</span>
                    </h3>
                    <p className="text-[#d5d5d5] text-[1rem] md:text-[1.1rem] max-w-xl leading-relaxed">
                      Descubre cada detalle de nuestros productos en video: promociones, novedades y mucho más.
                    </p>
                    <span className="mt-2 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/90 text-white bg-transparent flex items-center justify-center group-hover:scale-110 group-hover:border-brand group-hover:text-brand transition-all duration-300">
                      <Play size={30} className="ml-1" />
                    </span>
                  </div>
                </button>
              ) : (
                <VideoPlayer video={active} />
              )}

              {badge && (
                <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full flex items-center justify-center">
                  {badge === "youtube" && <YoutubeIcon size={24} />}
                  {badge === "tiktok" && <TiktokIcon size={20} />}
                </div>
              )}
            </div>
          </div>

          {/* Derecha 30% Playlist */}
          <div className="min-w-0 flex flex-col gap-3 min-h-0">
            <div className={`flex flex-col gap-4 min-h-0 flex-1 ${
              showAll ? "overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#d6ccc2_transparent]" : ""
            }`}>
            {(showAll ? videos : videos.slice(0, 4)).map((v) => {
              const isActive = active.id === v.id;
              const vThumb = videoThumb(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVideo(v)}
                  className={`flex gap-4 p-3 bg-[#151515] border-2 rounded-[16px] shadow-sm text-left cursor-pointer relative transition-all duration-300 group ${
                    isActive
                      ? "border-brand"
                      : "border-[#2a2a2a] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                  }`}
                >
                  <div className="w-28 h-24 flex-shrink-0 bg-[#232323] rounded-[8px] overflow-hidden relative">
                    {vThumb ? (
                      <>
                        <SkeletonImage
                          src={vThumb}
                          alt={v.title}
                          wrapperClassName="absolute inset-0"
                          imgClassName="group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play size={24} className="text-white drop-shadow-md" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#555]">
                        <Play size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center flex-grow min-w-0">
                    {isActive && (
                      <span className="text-brand text-[10px] font-bold tracking-wider mb-1 flex items-center gap-1.5 uppercase">
                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                        Reproduciendo
                      </span>
                    )}
                    <h4 className="text-[16px] leading-tight font-semibold text-[#fafaf7] group-hover:text-[#e05c2a] transition-colors line-clamp-2">
                      {v.title}
                    </h4>
                    </div>
                </button>
              );
            })}
            </div>

            {videos.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="w-full border-0 bg-transparent text-brand text-[0.85rem] font-bold tracking-[0.08em] uppercase cursor-pointer py-2.5 rounded-[12px] border-2 border-[#2a2a2a] hover:border-brand hover:bg-brand/10 transition-colors flex items-center justify-center gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} /> Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} /> Ver más ({videos.length - 4})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}