"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/productCard";
import type { Producto } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { getPromocionesActivasMap } from "@/lib/queries";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

interface Props {
  allCats: string[];
  banner: BannerConfig | null;
}

const ITEMS_PER_PAGE = 24;

export default function ProductosClient({ allCats: ALL_CATS, banner }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [cats, setCats] = useState<string[]>(
    searchParams.get("cat") ? [searchParams.get("cat")!] : [],
  );
  const [maxPrice, setMaxPrice] = useState<number>(99999);
  const [priceMax, setPriceMax] = useState<number>(99999);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [hideAgotado, setHideAgotado] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promocionesMap, setPromocionesMap] = useState<Record<number, any>>({});
  // ✅ promoIds se carga una vez al montar — no entra en deps de load
  const promoIdsRef = useRef<number[]>([]);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getPromocionesActivasMap().then((map) => {
      setPromocionesMap(map);
      // Guardamos en ref para usarlos en la query SIN causar re-render/re-load
      promoIdsRef.current = Object.keys(map).map(Number);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);

    // ✅ FIX CRÍTICO: si onlyPromo está activo pero no hay promos cargadas aún,
    // esperamos a que promoIdsRef tenga datos. Si no hay ninguna promo, vaciamos.
    if (onlyPromo && promoIdsRef.current.length === 0) {
      // Intentamos cargar el mapa directo aquí para no depender del useEffect de arriba
      const freshMap = await getPromocionesActivasMap();
      promoIdsRef.current = Object.keys(freshMap).map(Number);
      setPromocionesMap(freshMap);

      if (promoIdsRef.current.length === 0) {
        setProductos([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("productos")
      .select("*, categorias!inner(name, activo)", { count: "exact" })
      .eq("activo", true)
      .eq("categorias.activo", true)
      .order("id", { ascending: false })
      .range(from, to);

    if (cats.length > 0) {
      const { data: catData } = await supabase
        .from("categorias")
        .select("id, name")
        .in("name", cats)
        .eq("activo", true);

      const catIds = (catData ?? []).map((c: { id: number }) => c.id);

      if (catIds.length > 0) {
        query = query.in("category", catIds);
      } else {
        setProductos([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`,
      );
    }

    if (maxPrice < priceMax) {
      query = query.lte("price", maxPrice);
    }

    if (onlyFeatured) query = query.eq("featured", true);
    if (onlyNew) query = query.eq("is_new", true);
    if (onlyLowStock) query = query.eq("low_stock", true);
    if (hideAgotado) query = query.eq("agotado", true);

    // ✅ FIX: filtro de promo directo en la query con los IDs reales
    if (onlyPromo && promoIdsRef.current.length > 0) {
      query = query.in("id", promoIdsRef.current);
    }

    const { data, count, error } = await query;

    if (!error) {
      const mapped = (data ?? []).map((p: any) => ({
        ...p,
        category_name: p.categorias?.name ?? null,
        categorias: undefined,
      }));

      setProductos(mapped);
      setTotalCount(count ?? 0);

      if (priceMax === 99999 && mapped.length > 0) {
        const { data: maxData } = await supabase
          .from("productos")
          .select("price")
          .eq("activo", true)
          .order("price", { ascending: false })
          .limit(1)
          .single();

        if (maxData) {
          const rounded = Math.ceil(maxData.price / 100) * 100;
          setPriceMax(rounded);
          setMaxPrice(rounded);
        }
      }
    }

    setLoading(false);
  }, [
    currentPage,
    search,
    cats,
    maxPrice,
    priceMax,
    onlyFeatured,
    onlyNew,
    onlyLowStock,
    hideAgotado,
    onlyPromo,
    // ✅ promoIdsRef NO entra en deps porque es un ref, no estado
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    cats,
    maxPrice,
    onlyFeatured,
    onlyNew,
    onlyLowStock,
    onlyPromo,
    hideAgotado,
  ]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const cat = searchParams.get("cat");
    setSearch(q);
    setSearchInput(q);
    setCats(cat ? [cat] : []);
  }, [searchParams]);

  function handleSearchInput(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      router.replace(`/productos?${params.toString()}`, { scroll: false });
    }, 350);
  }

  function toggleCat(cat: string) {
    setCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function clearFilters() {
    setSearch("");
    setSearchInput("");
    setCats([]);
    setMaxPrice(priceMax);
    setOnlyFeatured(false);
    setOnlyNew(false);
    setOnlyLowStock(false);
    setOnlyPromo(false);
    setHideAgotado(false);
    router.replace("/productos", { scroll: false });
  }

  const activeFilters =
    cats.length +
    (onlyFeatured ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyLowStock ? 1 : 0) +
    (onlyPromo ? 1 : 0) +
    (maxPrice < priceMax ? 1 : 0) +
    (hideAgotado ? 1 : 0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const heroTitulo = banner?.titulo || "Nuestros Productos";
  const heroSub =
    banner?.subtitulo || "Equipos de cocina industrial con garantía.";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "3.5rem 1.5rem 3rem",
            maxWidth: "680px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#f5a623",
              marginBottom: "0.75rem",
            }}
          >
            Catálogo
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            {heroTitulo}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.75)",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {heroSub}
          </p>
        </div>
      </section>

      <div className="min-h-[80vh] pb-10">
        <button
          className="filter-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir filtros"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filtros
          {activeFilters > 0 && (
            <span className="filter-toggle__badge">{activeFilters}</span>
          )}
        </button>

        <div className="productos-layout">
          {/* ── Sidebar ── */}
          <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
            <div className="sidebar__header">
              <h2 className="sidebar__title">Filtros</h2>
              <div className="sidebar__header-actions">
                {activeFilters > 0 && (
                  <button className="sidebar__clear" onClick={clearFilters}>
                    Limpiar
                  </button>
                )}
                <button
                  className="sidebar__close"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div className="sidebar__section">
              <label className="sidebar__label">Categoría</label>
              <div className="sidebar__cats">
                {ALL_CATS.map((cat) => (
                  <label key={cat} className="sidebar__check-row">
                    <input
                      type="checkbox"
                      checked={cats.includes(cat)}
                      onChange={() => toggleCat(cat)}
                      className="sidebar__checkbox"
                    />
                    <span className="sidebar__check-label">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="sidebar__section">
              <label className="sidebar__label">
                Precio máximo
                <span className="sidebar__price-val">
                  {maxPrice >= priceMax
                    ? "Sin límite"
                    : `S/ ${maxPrice.toLocaleString("es-PE")}`}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={priceMax}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="sidebar__range"
              />
              <div className="sidebar__range-labels">
                <span>S/ 0</span>
                <span>S/ {priceMax.toLocaleString("es-PE")}</span>
              </div>
            </div>

            {/* ✅ Checkboxes — 5 filtros exactos pedidos */}
            <div className="sidebar__section">
              <label className="sidebar__check-row">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(e) => setOnlyNew(e.target.checked)}
                  className="sidebar__checkbox"
                />
                <span className="sidebar__check-label">Productos nuevos</span>
              </label>

              <label className="sidebar__check-row" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                  className="sidebar__checkbox"
                />
                <span className="sidebar__check-label">Últimas unidades</span>
              </label>

              {/* ✅ Destacados: filtra en query pero SIN tag en ProductCard */}
              <label className="sidebar__check-row" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="sidebar__checkbox"
                />
                <span className="sidebar__check-label">
                  Productos destacados
                </span>
              </label>

              {/* ✅ Solo con promoción — ahora filtra por IDs en la query */}
              <label className="sidebar__check-row" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="sidebar__checkbox"
                />
                <span className="sidebar__check-label">Con promociones</span>
              </label>

              {/* ✅ Renombrado: "Productos agotados" en vez de "Ocultar agotados" */}
              <label className="sidebar__check-row" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={hideAgotado}
                  onChange={(e) => setHideAgotado(e.target.checked)}
                  className="sidebar__checkbox"
                />
                <span className="sidebar__check-label">Productos agotados</span>
              </label>
            </div>
          </aside>

          {sidebarOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* ── Main content ── */}
          <main className="productos-main">
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ position: "relative", maxWidth: 480 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#ccc",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  style={{
                    width: "100%",
                    padding: "10px 16px 10px 36px",
                    border: "1.5px solid #e0d8d0",
                    borderRadius: 10,
                    fontSize: "0.88rem",
                    outline: "none",
                    background: "#fff",
                    boxSizing: "border-box",
                  }}
                  placeholder="Buscar productos..."
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f5a623";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0d8d0";
                  }}
                />
              </div>
            </div>

            <div className="productos-main__top">
              <p className="productos-main__count">
                <strong>{totalCount}</strong> producto
                {totalCount !== 1 ? "s" : ""}
                {cats.length > 0 && ` en ${cats.join(", ")}`}
              </p>
              {activeFilters > 0 && (
                <button
                  className="productos-main__clear"
                  onClick={clearFilters}
                >
                  × Limpiar filtros
                </button>
              )}
            </div>

            {search.trim() && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#fff8f0",
                    border: "1.5px solid #f5a623",
                    color: "#c47a00",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    borderRadius: 99,
                    padding: "4px 10px",
                  }}
                >
                  Buscando:
                  <strong style={{ color: "#1a1a1a" }}>
                    &ldquo;{search.trim()}&rdquo;
                  </strong>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      color: "#c47a00",
                      padding: "0 0 0 2px",
                    }}
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "60px 0",
                  color: "#888",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "3px solid #f0ebe4",
                    borderTop: "3px solid #f5a623",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: "0.9rem" }}>
                  Buscando productos...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : totalCount === 0 ? (
              <div className="productos-empty">
                <span>😕</span>
                <p>No se encontraron productos con esos filtros</p>
                <button onClick={clearFilters} className="productos-empty__btn">
                  Ver todos
                </button>
              </div>
            ) : (
              <>
                <div className="productos-grid">
                  {productos.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        ...p,
                        description: p.description ?? "",
                        featured: p.featured ?? false,
                        image_url: p.image_url ?? undefined,
                        is_new: p.is_new ?? false,
                        low_stock: p.low_stock ?? false,
                        agotado: p.agotado ?? false,
                        descuento: promocionesMap[p.id] ?? undefined,
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: "2rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      style={{
                        padding: "8px 16px",
                        border: "1.5px solid #e0d8d0",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#666",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.4 : 1,
                      }}
                    >
                      ← Anterior
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 7) page = i + 1;
                      else if (currentPage <= 4) page = i + 1;
                      else if (currentPage >= totalPages - 3)
                        page = totalPages - 6 + i;
                      else page = currentPage - 3 + i;

                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border:
                              currentPage === page
                                ? "2px solid #f5a623"
                                : "1.5px solid #e0d8d0",
                            background:
                              currentPage === page ? "#fff8e6" : "#fff",
                            color: currentPage === page ? "#f5a623" : "#666",
                          }}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "8px 16px",
                        border: "1.5px solid #e0d8d0",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#666",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                        opacity: currentPage === totalPages ? 0.4 : 1,
                      }}
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </main>
  );
}
