import Link from "next/link";
import PageHero from "@/components/PageHero";
import VideoSection from "@/components/VideoSection";
import { getVideos } from "@/lib/queries";

export const revalidate = 3600;

export default async function BlogPage() {
  const vlogs = await getVideos("vlog");

  return (
    <>
      <PageHero
        title="Blog & Vlog"
        subtitle="Contenido, consejos y novedades del mundo de la cocina industrial."
        dark
      />

      <VideoSection tipo="vlog" />

      <section className="blog-section">
        <div className="blog-inner">
          <div className="blog-head">
            <span className="blog-tag">Artículos</span>
            <h2 className="blog-title">Próximamente</h2>
            <p className="blog-sub">
              Estamos preparando contenido de valor para ti. Mientras tanto, revisa nuestros videos.
            </p>
            <Link href="/productos" className="blog-btn">Ver catálogo →</Link>
          </div>
        </div>
      </section>

      <style>{`
        .blog-section {
          padding: 5rem 1.5rem;
          background: #faf8f5;
        }
        .blog-inner {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        .blog-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.75rem;
        }
        .blog-title {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 1rem;
        }
        .blog-sub {
          font-size: 1rem;
          color: #777;
          line-height: 1.7;
          margin: 0 0 2rem;
        }
        .blog-btn {
          display: inline-block;
          background: #f5a623;
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.75rem 2rem;
          border-radius: 99px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .blog-btn:hover { background: #e69510; }
      `}</style>
    </>
  );
}