"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./cartDrawer";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";

const CAT_LABELS: Record<string, string> = {
  horno: "Hornos",
  "freidora-aire": "Freidoras de Aire",
  "maquina-hielo": "Máquinas de Hielo",
  refrigeracion: "Refrigeración",
  bebidas: "Bebidas",
  lavanderia: "Lavandería",
  panaderia: "Panadería",
  cocina: "Cocina",
  batidora: "Batidoras",
  procesador: "Procesadores",
  licuadora: "Licuadoras",
  extractor: "Extractores",
  molinillo: "Molinillos",
  "olla-presion": "Ollas a Presión",
  parrilla: "Parrillas",
  donut: "Donuteras",
  waflera: "Waffleras",
  balanza: "Balanzas",
  hervidor: "Hervidores",
  dispensador: "Dispensadores",
  "dispensador-agua": "Dispensadores de Agua",
  calefactor: "Calefactores",
  ventilador: "Ventiladores",
};

function catLabel(cat: string) {
  return (
    CAT_LABELS[cat] ??
    cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

interface NavbarProps {
  categories?: string[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [cats, setCats] = useState<string[]>(categories);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCats(categories);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data: string[]) => setCats(data))
      .catch(() => {});
  }, [categories.length]);

  useEffect(() => {
    let mounted = true;
    async function checkAuthAndRole() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!mounted) return;
      if (!user) {
        setIsLogged(false);
        setIsAdmin(false);
        setAuthChecked(true);
        return;
      }
      setIsLogged(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(profile?.role === "admin");
      setAuthChecked(true);
    }
    checkAuthAndRole();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndRole();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/productos?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setMobileOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
  }

  function openMega() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }

  function closeMega() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 180);
  }

  // Estilos inline para los nav links (evita ser pisado por globals.css)
  const navLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "6px 14px",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    background: "transparent",
    letterSpacing: "0.01em",
  };

  return (
    <>
      <div className="nb">
        <div className="nb__inner">
          <Link
            href="/"
            className="nb__logo"
            onClick={() => setMobileOpen(false)}
          >
            <span className="nb__logo-t">mkapu</span>
            <span className="nb__logo-s">import</span>
          </Link>

          <div
            className="nb__cat-trigger"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              className={`nb__cat-btn${megaOpen ? " nb__cat-btn--open" : ""}`}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Categorías
              <svg
                className="nb__chevron"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {megaOpen && (
              <div
                className="nb__mega"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <div className="nb__mega-grid">
                  <Link
                    href="/productos"
                    className="nb__mega-all"
                    onClick={() => setMegaOpen(false)}
                  >
                    <span>🛍️</span> Ver todos los productos
                  </Link>
                  {cats.map((cat) => (
                    <Link
                      key={cat}
                      href={`/productos?cat=${cat}`}
                      className="nb__mega-item"
                      onClick={() => setMegaOpen(false)}
                    >
                      {catLabel(cat)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ LINKS DESKTOP — estilos inline para evitar globals.css */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              flexShrink: 0,
            }}
          >
            <Link
              href="/blog"
              style={navLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5a623";
                e.currentTarget.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Blog
            </Link>
            <Link
              href="/quienes-somos"
              style={navLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5a623";
                e.currentTarget.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Quiénes Somos
            </Link>
            <Link
              href="/contacto"
              style={navLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5a623";
                e.currentTarget.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Contacto
            </Link>
          </nav>

          <form className="nb__search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nb__search-input"
            />
            <button
              type="submit"
              className="nb__search-btn"
              aria-label="Buscar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          <div className="nb__right">
            <div className="nb__socials">
              <a
                href="https://www.instagram.com/mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/mkapu.peru/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="Facebook"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="TikTok"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                </svg>
              </a>
            </div>

            <button
              className="nb__cart"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="nb__cart-label">Carrito</span>
              {count > 0 && <span className="nb__badge">{count}</span>}
            </button>

            {authChecked && isLogged && isAdmin && (
              <>
                <Link href="/admin/productos" className="nb__admin-btn">
                  <svg
                    className="nb__admin-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
                    <path d="M9.5 12.5l1.8 1.8 3.7-3.7" />
                  </svg>
                  <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>
                    PANEL
                  </span>
                </Link>
                <button
                  type="button"
                  className="nb__admin-btn nb__admin-btn--ghost"
                  onClick={handleLogout}
                >
                  <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>
                    SALIR
                  </span>
                </button>
              </>
            )}

            <button
              className="nb__burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
            >
              {mobileOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>

          <button
            onClick={() => router.push("/admin/login")}
            style={{
              width: "40px",
              height: "40px",
              background: "#f5a623",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginRight: "1rem",
              transition: "all 0.15s ease",
            }}
            title="Acceso admin"
            aria-label="Panel de administrador"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b77c1b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f5a623";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="nb__mobile">
            <form className="nb__mobile-search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nb__mobile-input"
                autoFocus
              />
              <button type="submit" className="nb__search-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <div className="nb__mobile-section">
              <p className="nb__mobile-label">Categorías</p>
              <div className="nb__mobile-cats">
                <Link
                  href="/productos"
                  className="nb__mobile-cat nb__mobile-cat--all"
                  onClick={() => setMobileOpen(false)}
                >
                  🛍️ Todos los productos
                </Link>
                {cats.map((cat) => (
                  <Link
                    key={cat}
                    href={`/productos?cat=${cat}`}
                    className="nb__mobile-cat"
                    onClick={() => setMobileOpen(false)}
                  >
                    {catLabel(cat)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nb__mobile-section">
              <p className="nb__mobile-label">Páginas</p>
              <div className="nb__mobile-pages">
                <Link
                  href="/blog"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  📝 Blog
                </Link>
                <Link
                  href="/quienes-somos"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  👥 Quiénes Somos
                </Link>
                <Link
                  href="/contacto"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  📬 Contacto
                </Link>
              </div>
            </div>

            <div className="nb__mobile-socials">
              {!isLogged && (
                <Link
                  href="/admin/login"
                  className="nb__mobile-social"
                  onClick={() => setMobileOpen(false)}
                >
                  Ingresar Admin
                </Link>
              )}
              {isLogged && isAdmin && (
                <>
                  <Link
                    href="/admin/productos"
                    className="nb__mobile-social"
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel Admin
                  </Link>
                  <button
                    type="button"
                    className="nb__mobile-social nb__mobile-logout"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </>
              )}
              <a
                href="https://www.instagram.com/mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/mkapu.peru/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                TikTok
              </a>
            </div>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style jsx>{`
        .nb {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #1a1a1a;
          border-bottom: 3px solid #f5a623;
        }
        .nb__inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .nb__logo {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          line-height: 1;
          flex-shrink: 0;
          gap: 0;
        }
        .nb__logo-t {
          font-size: 1.25rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.04em;
          text-transform: lowercase;
        }
        .nb__logo-s {
          font-size: 0.48rem;
          font-weight: 700;
          color: #f5a623;
          text-transform: uppercase;
          letter-spacing: 0.18em;
        }
        .nb__cat-trigger {
          position: relative;
          flex-shrink: 0;
        }
        .nb__cat-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #f5a623;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.5rem 0.85rem;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .nb__cat-btn:hover,
        .nb__cat-btn--open {
          background: #b77c1b;
        }
        .nb__chevron {
          transition: transform 0.2s;
        }
        .nb__cat-btn--open .nb__chevron {
          transform: rotate(180deg);
        }
        .nb__mega {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 320px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
          padding: 1rem;
          animation: megaIn 0.18s ease;
          border: 1px solid #ede8e1;
          z-index: 200;
        }
        @keyframes megaIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nb__mega-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .nb__mega-all {
          grid-column: 1/-1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.6rem 0.75rem;
          font-size: 0.88rem;
          font-weight: 800;
          color: #f5a623;
          text-decoration: none;
          border-radius: 8px;
          background: #fff1ec;
          margin-bottom: 4px;
          transition: background 0.15s;
        }
        .nb__mega-all:hover {
          background: #fbd5c5;
        }
        .nb__mega-item {
          display: block;
          padding: 0.5rem 0.75rem;
          font-size: 0.83rem;
          font-weight: 600;
          color: #444;
          text-decoration: none;
          border-radius: 8px;
          text-transform: capitalize;
          transition:
            background 0.12s,
            color 0.12s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nb__mega-item:hover {
          background: #fff1ec;
          color: #f5a623;
        }
        .nb__search {
          flex: 1;
          max-width: 320px;
          display: flex;
          align-items: center;
          background: #2a2a2a;
          border: 1.5px solid #333;
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .nb__search:focus-within {
          border-color: #f5a623;
        }
        .nb__search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem 0.75rem;
          font-size: 0.87rem;
          outline: none;
          color: #fff;
          min-width: 0;
        }
        .nb__search-input::placeholder {
          color: #555;
        }
        .nb__search-btn {
          background: #f5a623;
          border: none;
          padding: 0 13px;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .nb__search-btn:hover {
          background: #b77c1b;
        }
        .nb__right {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .nb__socials {
          display: flex;
          align-items: center;
          gap: 2px;
          border-right: 1px solid #2a2a2a;
          padding-right: 10px;
          margin-right: 4px;
        }
        .nb__social {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #888;
          text-decoration: none;
          transition:
            color 0.15s,
            background 0.15s;
        }
        .nb__social:hover {
          color: #fff;
          background: #2a2a2a;
        }
        .nb__cart {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #f5a623;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          transition:
            background 0.15s,
            transform 0.12s;
          white-space: nowrap;
        }
        .nb__cart:hover {
          background: #b77c1b;
          transform: translateY(-1px);
        }
        .nb__badge {
          position: absolute;
          top: -7px;
          right: -7px;
          background: #fff;
          color: #f5a623;
          font-size: 0.6rem;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #f5a623;
          animation: badgeIn 0.2s ease;
        }
        .nb__admin-btn {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          border-radius: 10px;
          border: none;
          background: #f5a623;
          color: #1a1a1a !important;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          min-width: 90px;
          flex-shrink: 0;
          text-transform: uppercase;
        }
        .nb__admin-btn:hover {
          background: #b77c1b;
          color: #fff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
        }
        .nb__admin-icon {
          opacity: 0.95;
        }
        .nb__admin-btn--ghost {
          background: transparent;
          border: 1px solid #555;
          color: #ddd !important;
        }
        .nb__admin-btn--ghost:hover {
          background: #2a2a2a;
          border-color: #777;
          color: #fff !important;
        }
        @keyframes badgeIn {
          from {
            transform: scale(0.4);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .nb__burger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .nb__burger:hover {
          background: #2a2a2a;
        }
        .nb__mobile {
          background: #111;
          border-top: 1px solid #2a2a2a;
          padding: 1rem 1.5rem 1.5rem;
          animation: slideDown 0.22s ease;
          max-height: 75vh;
          overflow-y: auto;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nb__mobile-search {
          display: flex;
          align-items: center;
          background: #2a2a2a;
          border: 1.5px solid #333;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .nb__mobile-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.6rem 0.75rem;
          font-size: 0.9rem;
          outline: none;
          color: #fff;
        }
        .nb__mobile-input::placeholder {
          color: #555;
        }
        .nb__mobile-section {
          margin-bottom: 1.25rem;
        }
        .nb__mobile-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555;
          margin: 0 0 0.75rem;
        }
        .nb__mobile-cats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .nb__mobile-cat {
          display: block;
          padding: 0.55rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #ccc;
          text-decoration: none;
          background: #1e1e1e;
          border-radius: 8px;
          text-transform: capitalize;
          border: 1px solid #2a2a2a;
          transition:
            background 0.15s,
            color 0.15s;
        }
        .nb__mobile-cat:hover {
          background: #f5a623;
          color: #fff;
          border-color: #f5a623;
        }
        .nb__mobile-cat--all {
          grid-column: 1/-1;
          background: #f5a623;
          color: #fff;
          border-color: #f5a623;
          font-weight: 700;
        }
        .nb__mobile-cat--all:hover {
          background: #b77c1b;
        }
        .nb__mobile-pages {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .nb__mobile-page {
          display: block;
          padding: 0.55rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #ccc;
          text-decoration: none;
          background: #1e1e1e;
          border-radius: 8px;
          border: 1px solid #2a2a2a;
          transition:
            background 0.15s,
            color 0.15s;
        }
        .nb__mobile-page:hover {
          background: #f5a623;
          color: #fff;
          border-color: #f5a623;
        }
        .nb__mobile-socials {
          display: flex;
          gap: 10px;
          border-top: 1px solid #2a2a2a;
          padding-top: 1rem;
          flex-wrap: wrap;
        }
        .nb__mobile-social {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-decoration: none;
          transition: color 0.15s;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .nb__mobile-social:hover {
          color: #f5a623;
        }
        .nb__mobile-logout {
          color: #ddd;
        }
        @media (max-width: 860px) {
          nav[style] {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .nb__inner {
            padding: 0 1rem;
            gap: 0.5rem;
          }
          .nb__cat-trigger {
            display: none;
          }
          .nb__search {
            max-width: 260px;
          }
          .nb__socials {
            display: none;
          }
          .nb__cart-label {
            display: none;
          }
          .nb__cart {
            padding: 0.5rem 0.7rem;
          }
          .nb__admin-btn {
            display: none !important;
          }
          .nb__burger {
            display: flex;
          }
          .nb__mobile {
            padding: 1rem;
          }
        }
        @media (max-width: 480px) {
          .nb__mobile-cats {
            grid-template-columns: 1fr;
          }
          .nb__search {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
