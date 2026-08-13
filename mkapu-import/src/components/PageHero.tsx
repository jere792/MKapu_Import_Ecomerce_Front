import Image from "next/image";
import { supabase } from "@/lib/supabase";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

interface Props {
  ruta: string;
  fallbackTitulo?: string;
  fallbackSubtitulo?: string;
}

export default async function PageHero({ ruta, fallbackTitulo = "", fallbackSubtitulo }: Props) {
  const { data } = await supabase
    .from("banners_config")
    .select("titulo, subtitulo, image_url, activo")
    .eq("ruta", ruta)
    .single();

  const banner = data as BannerConfig | null;

  // Si no está activo, usa fallback sin imagen
  const titulo = banner?.titulo || fallbackTitulo;
  const subtitulo = banner?.subtitulo || fallbackSubtitulo || null;
  const imageUrl = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <section className="relative w-full min-h-[280px] flex items-center justify-center bg-[#111] overflow-hidden max-[640px]:min-h-[220px]">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={titulo}
          fill
          priority
          className="object-cover object-center"
          style={{ objectFit: "cover" }}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.65)_100%)] z-[1]" />
      <div className="relative z-[2] text-center px-6 py-12 max-w-[700px]">
        <p className="text-[0.72rem] font-bold tracking-[0.15em] text-brand uppercase mb-3">ESTAMOS PARA AYUDARTE</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-3 leading-[1.1]">{titulo}</h1>
        {subtitulo && <p className="text-base text-white/75 leading-relaxed">{subtitulo}</p>}
      </div>
    </section>
  );
}