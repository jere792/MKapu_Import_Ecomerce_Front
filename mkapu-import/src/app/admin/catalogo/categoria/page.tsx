import { notFound } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getCategorias, getProductosByCategoria } from "@/lib/queries";
import ProductCard from "@/components/productCard";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categorias = await getCategorias();
  return categorias.map((c) => ({ categoria: String(c.id) }));
}

type AnyProduct = any;

export default async function CatalogoPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: categoriaParam } = await params;

  const categorias = await getCategorias();
  const categoria = categorias.find((c) => String(c.id) === categoriaParam);

  if (!categoria) notFound();

  const products = await getProductosByCategoria(categoriaParam);
  const activos = products.filter((p: AnyProduct) => p.activo !== false);

  return (
    <>
      <PageHero
        title={categoria.name}
        subtitle={`${activos.length} producto${activos.length !== 1 ? "s" : ""} disponible${activos.length !== 1 ? "s" : ""} en esta categoría.`}
        dark
      />

      <section className="cat-section">
        <div className="cat-inner">
          <div className="cat-breadcrumb">
            <Link href="/">Inicio</Link>
            <span>›</span>
            <Link href="/productos">Productos</Link>
            <span>›</span>
            <span>{categoria.name}</span>
          </div>

          {activos.length === 0 ? (
            <div className="cat-empty">
              <p>No hay productos disponibles en esta categoría aún.</p>
              <Link href="/productos" className="cat-btn">
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <div className="cat-grid">
              {activos.map((p: AnyProduct) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    description: p.description ?? "",
                    featured: p.featured ?? false,
                    image_url: p.image_url ?? undefined,
                    price_caja: p.price_caja ?? undefined,
                    unidad_caja: p.unidad_caja ?? undefined,
                    price_mayorista: p.price_mayorista ?? undefined,
                    unidad_mayorista: p.unidad_mayorista ?? undefined,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .cat-section {
          padding: 2rem 1.5rem 4rem;
          background: #faf8f5;
        }
        .cat-inner {
          max-width: 1300px;
          margin: 0 auto;
        }
        .cat-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: #888;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .cat-breadcrumb a {
          color: #f5a623;
          text-decoration: none;
          font-weight: 600;
        }
        .cat-breadcrumb a:hover { text-decoration: underline; }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.25rem;
        }
        .cat-empty {
          text-align: center;
          padding: 4rem 1rem;
          color: #888;
        }
        .cat-empty p { margin: 0 0 1.5rem; font-size: 1rem; }
        .cat-btn {
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
        .cat-btn:hover { background: #e69510; }
        @media (max-width: 640px) {
          .cat-grid {
            grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
