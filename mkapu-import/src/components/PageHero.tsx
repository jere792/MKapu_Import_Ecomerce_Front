interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  dark?: boolean;
}

export default function PageHero({ title, subtitle, image, dark = false }: PageHeroProps) {
  return (
    <div className={`page-hero${dark ? " page-hero--dark" : ""}`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}>
      <div className="page-hero__overlay" />
      <div className="page-hero__content">
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__sub">{subtitle}</p>}
      </div>
      <style>{`
        .page-hero {
          position: relative;
          width: 100%;
          height: 800px;
          background: #1a1a1a;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
        }
        .page-hero--dark {
          background-color: #0d0d0d;
        }
        .page-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%);
        }
        .page-hero__content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .page-hero__title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #fff;
          margin: 0 0 0.5rem;
          line-height: 1.1;
        }
        .page-hero__sub {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: rgba(255,255,255,0.7);
          margin: 0;
          max-width: 560px;
        }
        @media (max-width: 768px) {
          .page-hero {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
