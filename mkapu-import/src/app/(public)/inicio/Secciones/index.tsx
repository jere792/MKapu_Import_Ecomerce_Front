import { supabase } from "@/lib/supabase";
import HomeSeccionesCarousel from "./HomeSeccionesCarousel";

type Producto = {
  id: number;
  code: string;
  name: string;
  category: number;
  description: string;
  price: number;
  featured: boolean;
  image_url: string;
  activo: boolean;
  is_new: boolean;
};

type Categoria = {
  id: number;
  name: string;
  slug?: string;
};

type Seccion = {
  orden: number;
  categoria_id: number;
  categorias: Categoria | Categoria[] | null;
};

export default async function HomeSecciones() {
  // ANTES: 3 queries — secciones → catIds → productos filtrados
  // AHORA: 2 queries en paralelo con Promise.all
  const [{ data: secciones }, { data: productos }] = await Promise.all([
    supabase
      .from("home_secciones")
      .select("orden, categoria_id, categorias(id, name, slug)")
      .eq("activo", true)
      .order("orden"),
    supabase.from("productos").select("*").eq("activo", true).order("name"),
  ]);

  if (!secciones?.length) return <div style={{ minHeight: "400px" }} />;

  const seccionesTyped = secciones as Seccion[];

  // Filtrar en memoria — sin query adicional
  const catIds = new Set(seccionesTyped.map((s) => s.categoria_id));

  const prodPorCat: Record<number, Producto[]> = {};
  for (const p of (productos ?? []) as Producto[]) {
    if (!catIds.has(p.category)) continue;
    if (!prodPorCat[p.category]) prodPorCat[p.category] = [];
    prodPorCat[p.category].push(p);
  }

  return (
    <>
      {seccionesTyped.map((sec) => {
        const cat = Array.isArray(sec.categorias)
          ? sec.categorias[0]
          : sec.categorias;

        if (!cat) return null;

        const prods = prodPorCat[sec.categoria_id] ?? [];
        if (!prods.length) return null;

        return (
          <section
            key={sec.categoria_id}
            style={{
              padding: "72px 0",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                maxWidth: 1400,
                margin: "0 auto",
                padding: "0 24px",
              }}
            >
              <div
                style={{
                  marginBottom: 32,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#f5a623",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Categoría
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#1a1a1a",
                  }}
                >
                  {cat.name}
                </h2>
              </div>

              <HomeSeccionesCarousel
                products={prods.map((p) => ({
                  ...p,
                  category_name: cat.name,
                }))}
                categoryName={cat.name}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
