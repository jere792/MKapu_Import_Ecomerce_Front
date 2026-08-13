"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  orden: number;
  imagen_principal: string | null;
};

type Props = {
  posts: BlogPost[];
  banner: BannerConfig | null;
};

export default function BlogList({ posts, banner }: Props) {
  const heroTitulo = banner?.titulo || "Nuestro Blog";
  const heroSub =
    banner?.subtitulo ||
    "Mantente al día con nuestras últimas noticias y novedades";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <main className="bg-bg min-h-screen">
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
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase text-brand mb-3 px-4 py-[0.4rem] border border-[rgba(245,166,35,0.3)] rounded-full bg-[rgba(245,166,35,0.08)]">Noticias y novedades</span>
          <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-black text-white tracking-[-0.03em] mb-4 leading-[1.05]">{heroTitulo}</h1>
          <p className="text-[1.05rem] text-white/70 mx-auto leading-[1.7] max-w-[520px]">{heroSub}</p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-[120px] max-[768px]:py-[60px] max-[768px]:px-5 max-[768px]:pb-20 max-[520px]:px-3.5 max-[520px]:pt-10 max-[520px]:pb-[60px]">
        {posts.length === 0 ? (
          <div className="text-center py-20 px-5 text-base text-[#aaa]">No hay publicaciones aún.</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8 max-[768px]:gap-6 max-[520px]:grid-cols-1 max-[520px]:gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group bg-white rounded-[20px] overflow-hidden border border-[#ece3d7] shadow-[0_10px_30px_rgba(78,52,24,0.08)] flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(224,92,42,0.15)]"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-[linear-gradient(135deg,#fff7ef_0%,#f2ece5_100%)]">
                  {post.imagen_principal ? (
                    <Image
                      src={post.imagen_principal}
                      alt={post.titulo}
                      fill
                      className="object-cover transition-transform duration-[0.4s] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#b4aaa3] font-semibold">Sin imagen</div>
                  )}
                </div>

                <div className="p-6 flex flex-col gap-3 flex-1 max-[768px]:p-5">
                  <div className="flex items-center gap-1.5 text-[0.85rem] text-[#95877d] font-semibold">
                    <Calendar size={14} />
                    <span>
                      {new Date(post.fecha_publicacion).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <h2 className="text-[1.4rem] font-extrabold leading-[1.3] text-[#1f1a17] max-[768px]:text-[1.25rem]">{post.titulo}</h2>

                  <p className="text-[0.95rem] text-[#72675f] leading-[1.6] flex-1 line-clamp-3">{post.descripcion}</p>

                  <div className="flex items-center gap-2 text-[#e05c2a] font-bold text-[0.9rem] mt-auto">
                    Leer más <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}