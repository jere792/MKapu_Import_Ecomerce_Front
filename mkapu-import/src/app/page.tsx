import Link from "next/link";
import Carousel from "@/components/carousel";
import { getProductos } from "@/lib/queries";
import HeroAccordion from "@/components/HeroAccordion";

type AnyProduct = any;

function byCategory(products: AnyProduct[], cat: string) {
  return products.filter((p) => p.category === cat);
}

function toCarouselProduct(p: AnyProduct) {
  return {
    ...p,
    // mapeo snake_case -> camelCase para componentes viejos
    imageUrl: p.image_url ?? "",
    pricemCaja: p.price_caja ?? undefined,
    unidadcaja: p.unidad_caja ?? undefined,
    priceMayorista: p.price_mayorista ?? undefined,
    unidadMayorista: p.unidad_mayorista ?? undefined,
    description: p.description ?? "",
    featured: p.featured ?? false,
  };
}

function CarouselSection({
  tag,
  title,
  subtitle,
  products,
  href,
  dark = false,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  products: AnyProduct[];
  href: string;
  dark?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className={`csec${dark ? " csec--dark" : ""}`}>
      <div className="csec__inner">
        <div className="csec__head">
          {tag && <span className="csec__tag">{tag}</span>}
          <h2 className="csec__title">{title}</h2>
          {subtitle && <p className="csec__sub">{subtitle}</p>}
        </div>

        <Carousel products={products.map(toCarouselProduct)} title="" />

        <div className="csec__foot">
          <Link href={href} className="csec__link">
            Ver todos →
          </Link>
        </div>
      </div>

      <style>{`
        .csec {
          padding: 4rem 1.5rem;
          background: #faf8f5;
        }
        .csec--dark {
          background: #111;
        }
        .csec__inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .csec__head {
          text-align: center;
          margin-bottom: 2rem;
        }
        .csec__tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }
        .csec__title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
        }
        .csec--dark .csec__title {
          color: #fff;
        }
        .csec__sub {
          font-size: 0.92rem;
          color: #777;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .csec--dark .csec__sub {
          color: #888;
        }
        .csec__foot {
          text-align: center;
          margin-top: 1.5rem;
        }
        .csec__link {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f5a623;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: border-color 0.15s;
        }
        .csec__link:hover {
          border-color: #f5a623;
        }
      `}</style>
    </section>
  );
}

const WHY_ITEMS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="1" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: "Directo del fabricante",
    desc: "Sin intermediarios. Precios competitivos con calidad de primera.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Soporte técnico local",
    desc: "Equipo en Lima para instalación, mantenimiento y garantía.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Despacho rápido",
    desc: "Entrega en Lima Metropolitana en 24–48 horas hábiles.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Asesoría personalizada",
    desc: "Te ayudamos a elegir el equipo ideal para tu negocio.",
  },
];

export default async function HomePage() {
  const products = await getProductos();

  const featured = products.filter((p: AnyProduct) => p.featured);
  const hornos = byCategory(products, "horno");
  const freidorasAire = byCategory(products, "freidora-aire");
  const maquinaHielo = byCategory(products, "maquina-hielo");
  const refrigeracion = byCategory(products, "refrigeracion");

  return (
    <div className="home">
      <HeroAccordion />

      <CarouselSection
        tag="Más vendidos"
        title="Productos destacados"
        subtitle="Los equipos más solicitados por restaurantes y hoteles de Lima."
        products={featured.length > 0 ? featured : products.slice(0, 10)}
        href="/productos"
      />

      <CarouselSection
        tag="Categoría"
        title="Hornos"
        subtitle="Hornos eléctricos y a gas para cocinas profesionales."
        products={hornos}
        href="/productos?cat=horno"
        dark
      />

      <CarouselSection
        tag="Tendencia"
        title="Freidoras de Aire"
        subtitle="Cocina saludable sin aceite. Todos nuestros productos con garantía de 60 días."
        products={freidorasAire}
        href="/productos?cat=freidora-aire"
      />

      <CarouselSection
        tag="Categoría"
        title="Máquinas de Hielo"
        subtitle="Producción continua 24h, potencia industrial, fácil mantenimiento."
        products={maquinaHielo}
        href="/productos?cat=maquina-hielo"
        dark
      />

      <CarouselSection
        tag="Categoría"
        title="Refrigeración"
        subtitle="Cámaras frías, vitrinas exhibidoras y equipos de conservación."
        products={refrigeracion}
        href="/productos?cat=refrigeracion"
      />

      <section className="why">
        <div className="why__inner">
          <div className="why__head">
            <span className="why__tag">¿Por qué elegirnos?</span>
            <h2 className="why__title">
              Importación directa,
              <br />
              <em>calidad garantizada</em>
            </h2>
          </div>
          <div className="why__grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="why__card">
                <div className="why__num">{item.num}</div>
                <div className="why__icon-wrap">{item.icon}</div>
                <h3 className="why__card-title">{item.title}</h3>
                <p className="why__card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .home {
          overflow-x: hidden;
        }
        .why {
          background: #0d0d0d;
          padding: 96px 40px;
        }
        .why__inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .why__head {
          margin-bottom: 72px;
        }
        .why__tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 16px;
        }
        .why__title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          max-width: 620px;
        }
        .why__title em {
          font-style: normal;
          color: #f5a623;
        }
        .why__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }
        .why__card {
          padding: 40px 32px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .why__card:last-child {
          border-right: none;
        }
        .why__num {
          font-size: 72px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.04);
          line-height: 1;
          margin-bottom: -16px;
          letter-spacing: -4px;
        }
        .why__icon-wrap {
          width: 40px;
          height: 40px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .why__icon-wrap :global(svg) {
          width: 28px;
          height: 28px;
          stroke: #e05c2a;
          fill: none;
          stroke-width: 1.5;
        }
        .why__card-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        .why__card-desc {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.65;
        }

        @media (max-width: 768px) {
          .why__grid {
            grid-template-columns: 1fr 1fr;
          }
          .why__card {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .why__card:nth-child(2n) {
            border-right: none;
          }
        }
        @media (max-width: 480px) {
          .why__grid {
            grid-template-columns: 1fr;
          }
          .why__card {
            border-right: none;
          }
        }
      `}</style>
    </div>
  );
}
