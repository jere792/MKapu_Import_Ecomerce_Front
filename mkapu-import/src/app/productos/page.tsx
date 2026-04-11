"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/productCard";
import rawProducts from "@/data/products.json";

const productsData = rawProducts as any[];

const ALL_CATS = Array.from(
  new Set(productsData.map((p) => p.category as string)),
);

const allPrices = productsData
  .map((p) => p.price as number | undefined)
  .filter((p): p is number => typeof p === "number" && p > 0);

const PRICE_MAX =
  allPrices.length > 0 ? Math.ceil(Math.max(...allPrices) / 100) * 100 : 5000;

export default function ProductosPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [cats, setCats] = useState<string[]>(
    searchParams.get("cat") ? [searchParams.get("cat")!] : [],
  );
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Reacciona a cambios de URL (?q= y ?cat=) ──
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const cat = searchParams.get("cat");
    setSearch(q);
    setCats(cat ? [cat] : []);
  }, [searchParams]);

  function toggleCat(cat: string) {
    setCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function clearFilters() {
    setSearch("");
    setCats([]);
    setMaxPrice(PRICE_MAX);
    setOnlyFeatured(false);
  }

  const filtered = useMemo(() => {
    let list = productsData;
    if (cats.length > 0) list = list.filter((p) => cats.includes(p.category));
    if (onlyFeatured) list = list.filter((p) => p.featured);
    if (maxPrice < PRICE_MAX)
      list = list.filter((p) => !p.price || p.price <= maxPrice);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [cats, onlyFeatured, maxPrice, search]);

  const activeFilters =
    cats.length + (onlyFeatured ? 1 : 0) + (maxPrice < PRICE_MAX ? 1 : 0);

  return (
    <div className="productos-page">
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
        {/* ── SIDEBAR ── */}
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
                  <span className="sidebar__check-label">
                    {cat.replace(/-/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar__section">
            <label className="sidebar__label">
              Precio máximo
              <span className="sidebar__price-val">
                {maxPrice >= PRICE_MAX
                  ? "Sin límite"
                  : `S/ ${maxPrice.toLocaleString()}`}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="sidebar__range"
            />
            <div className="sidebar__range-labels">
              <span>S/ 0</span>
              <span>S/ {PRICE_MAX.toLocaleString()}</span>
            </div>
          </div>

          <div className="sidebar__section">
            <label className="sidebar__check-row">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(e) => setOnlyFeatured(e.target.checked)}
                className="sidebar__checkbox"
              />
              <span className="sidebar__check-label">Solo destacados ⭐</span>
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

        {/* ── MAIN ── */}
        <main className="productos-main">
          <div className="productos-main__top">
            <p className="productos-main__count">
              <strong>{filtered.length}</strong> producto
              {filtered.length !== 1 ? "s" : ""}
              {cats.length > 0 &&
                ` en ${cats.map((c) => c.replace(/-/g, " ")).join(", ")}`}
            </p>
            {activeFilters > 0 && (
              <button className="productos-main__clear" onClick={clearFilters}>
                × Limpiar filtros
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="productos-empty">
              <span>😕</span>
              <p>No se encontraron productos con esos filtros</p>
              <button onClick={clearFilters} className="productos-empty__btn">
                Ver todos
              </button>
            </div>
          ) : (
            <div className="productos-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .productos-page {
          max-width: 1300px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
        }

        .filter-toggle {
          display: none;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #e0d8d0;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1rem;
          position: relative;
          color: #1a1a1a;
          transition: border-color 0.15s;
        }
        .filter-toggle:hover {
          border-color: #e05c2a;
          color: #e05c2a;
        }
        .filter-toggle__badge {
          background: #e05c2a;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 99px;
          padding: 1px 6px;
          min-width: 18px;
          text-align: center;
        }

        .productos-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .sidebar {
          background: #fff;
          border: 1px solid #ede8e1;
          border-radius: 16px;
          padding: 1.25rem;
          position: sticky;
          top: 108px;
        }
        .sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .sidebar__title {
          font-size: 1rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }
        .sidebar__header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar__clear {
          font-size: 0.75rem;
          font-weight: 600;
          color: #e05c2a;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .sidebar__close {
          display: none;
          background: none;
          border: none;
          font-size: 1.4rem;
          cursor: pointer;
          color: #888;
          line-height: 1;
          padding: 0;
        }

        .sidebar__section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f0ebe4;
        }
        .sidebar__section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .sidebar__label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #888;
          margin-bottom: 0.75rem;
        }
        .sidebar__price-val {
          font-size: 0.8rem;
          font-weight: 700;
          color: #e05c2a;
          text-transform: none;
          letter-spacing: 0;
        }

        .sidebar__search {
          width: 100%;
          box-sizing: border-box;
          padding: 0.55rem 0.75rem;
          border: 1.5px solid #e0d8d0;
          border-radius: 10px;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.15s;
          background: #faf8f5;
        }
        .sidebar__search:focus {
          border-color: #e05c2a;
        }

        .sidebar__cats {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 240px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .sidebar__check-row {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .sidebar__checkbox {
          width: 15px;
          height: 15px;
          accent-color: #e05c2a;
          cursor: pointer;
          flex-shrink: 0;
        }
        .sidebar__check-label {
          font-size: 0.85rem;
          color: #444;
          text-transform: capitalize;
          line-height: 1.3;
        }

        .sidebar__range {
          width: 100%;
          accent-color: #e05c2a;
          cursor: pointer;
        }
        .sidebar__range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #aaa;
          margin-top: 4px;
        }

        .productos-main__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 8px;
        }
        .productos-main__count {
          font-size: 0.85rem;
          color: #777;
          margin: 0;
        }
        .productos-main__count strong {
          color: #1a1a1a;
        }
        .productos-main__clear {
          font-size: 0.8rem;
          font-weight: 600;
          color: #e05c2a;
          background: #fff1ec;
          border: none;
          border-radius: 99px;
          padding: 4px 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .productos-main__clear:hover {
          background: #fbd5c5;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .productos-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem 1rem;
          color: #888;
        }
        .productos-empty span {
          font-size: 3rem;
        }
        .productos-empty p {
          margin: 0;
        }
        .productos-empty__btn {
          padding: 0.5rem 1.25rem;
          background: #e05c2a;
          color: #fff;
          border: none;
          border-radius: 99px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .filter-toggle {
            display: flex;
          }
          .productos-layout {
            grid-template-columns: 1fr;
          }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: min(320px, 85vw);
            height: 100dvh;
            overflow-y: auto;
            z-index: 200;
            border-radius: 0;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
          }
          .sidebar--open {
            transform: translateX(0);
          }
          .sidebar__close {
            display: block;
          }
          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            z-index: 199;
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .productos-grid {
            grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
