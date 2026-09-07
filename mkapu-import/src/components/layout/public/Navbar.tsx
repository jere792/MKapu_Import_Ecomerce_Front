"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "../../cartDrawer";
import SubNavbar from "./SubNavbar";
import { useCart } from "@/app/context/CartContext";
import { useEmpresa } from "@/context/EmpresaContext";
import { supabase } from "@/lib/supabase";
import { LayoutGrid } from "lucide-react";
import {
  ShieldCheckIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type Categoria =
  | string
  | {
      id: number;
      name: string;
      activo?: boolean;
    };

type SearchSuggestion = {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
  category_name?: string | null;
};

interface NavbarProps {
  categories?: Categoria[];
}

function getCategoryKey(cat: Categoria) {
  return typeof cat === "string" ? cat : cat.id;
}

function getCategoryName(cat: Categoria) {
  return typeof cat === "string" ? cat : cat.name;
}

function getCategoryHref(cat: Categoria) {
  if (typeof cat === "string") {
    return `/productos?cat=${encodeURIComponent(cat)}`;
  }
  return `/productos?cat=${cat.id}`;
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { empresa, loaded: logoLoaded } = useEmpresa();

  const logoUrl = empresa?.logo || "";
  const socialUrls = {
    instagram: empresa?.instagram_url || null,
    facebook: empresa?.facebook_url || null,
    tiktok: empresa?.tiktok_url || null,
  };

  const [cats, setCats] = useState<Categoria[]>(categories);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cartPop, setCartPop] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current && count > 0) {
      setCartPop(true);
      const t = setTimeout(() => setCartPop(false), 300);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // ✅ FIX: useEffect que faltaba para verificar auth desde localStorage
  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");
    const adminNombre = localStorage.getItem("admin_nombre");

    if (adminId && adminNombre) {
      setIsLogged(true);
      setIsAdmin(true);
    } else {
      setIsLogged(false);
      setIsAdmin(false);
    }

    // Marca que ya se verificó — esto desbloquea el render del candado/panel
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setCats(categories);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data: Categoria[]) => setCats(data))
      .catch(() => setCats([]));
  }, [categories]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setSuggestOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    const term = search.trim();

    if (term.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      setLoadingSuggest(false);
      return;
    }

    setLoadingSuggest(true);
    setSuggestOpen(true); // ✅ Abrir panel inmediatamente para mostrar "Buscando..."

    suggestTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, name, image_url, price, categorias(name)")
        .eq("activo", true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .order("featured", { ascending: false })
        .limit(6);

      const mapped: SearchSuggestion[] = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url ?? null,
        price: p.price,
        category_name: p.categorias?.name ?? null,
      }));

      setSuggestions(mapped);
      setSuggestOpen(true);
      setLoadingSuggest(false);
    }, 250);

    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    setSuggestOpen(false);
    router.push(`/productos?q=${encodeURIComponent(search.trim())}`);
    setMobileOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_nombre");
    setIsLogged(false);
    setIsAdmin(false);
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

  function handleSuggestionClick(item: SearchSuggestion) {
    setSearch("");
    setSuggestions([]);
    setSuggestOpen(false);
    setMobileOpen(false);
    router.push(`/productos/${item.id}`);
  }

  const suggestPanelClass = (mobile: boolean) =>
    `${
      mobile ? "static mt-2.5 shadow-none" : "absolute top-[calc(100%+8px)] left-0 w-full shadow-[0_18px_36px_rgba(0,0,0,0.12)]"
    } bg-white border border-[#ece3d8] rounded-2xl overflow-hidden z-[60]`;

  return (
    <>
      <div className="sticky top-0 z-[100] bg-[#1a1a1a] border-b-[3px] border-[#f5a623]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="flex flex-col no-underline leading-none shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span
              className={`block h-10 min-w-[120px] ${
                !logoLoaded
                  ? "bg-[linear-gradient(90deg,#2a2a2a_25%,#3a3a3a_50%,#2a2a2a_75%)] bg-[length:200%_100%] animate-[nbLogoShimmer_1.4s_ease-in-out_infinite] rounded-lg"
                  : ""
              }${logoUrl ? "" : " min-w-0"}`}
            >
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="MKapu Import"
                  className="h-10 w-auto block transition-transform hover:scale-125"
                  fetchPriority="high"
                  loading="eager"
                />
              )}
            </span>
          </Link>

          <span className="hidden md:block text-[#4a4a4a] text-2xl font-light leading-none select-none shrink-0">|</span>

          <div
            className="relative shrink-0 hidden md:block"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              type="button"
              className={`flex items-center gap-[7px] bg-[#f5a623] text-white border-0 rounded-[10px] px-5 py-2.5 text-[0.86rem] font-bold cursor-pointer transition-colors whitespace-nowrap hover:bg-[#b77c1b] ${
                megaOpen ? "bg-[#b77c1b]" : ""
              }`}
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
              Menú
              <svg
                className={`transition-transform ${megaOpen ? "rotate-180" : ""}`}
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
                className="absolute top-[calc(100%+8px)] left-0 min-w-[320px] bg-white rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] p-4 border border-[#ede8e1] z-[200] animate-[megaIn_0.18s_ease]"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <Link
                    href="/productos"
                    className="col-span-2 flex items-center gap-2 px-3 py-2.5 text-[0.88rem] font-extrabold text-[#f5a623] no-underline rounded-lg bg-[#fff1ec] mb-1 transition-colors hover:bg-[#fbd5c5]"
                    onClick={() => setMegaOpen(false)}
                  >
                    <LayoutGrid size={16} className="shrink-0" /> Catálogo
                  </Link>

                  {cats.map((cat) => (
                    <Link
                      key={getCategoryKey(cat)}
                      href={getCategoryHref(cat)}
                      className="block px-3.5 py-2.5 text-[0.83rem] font-semibold text-[#444] no-underline rounded-lg capitalize transition-colors hover:bg-[#fff1ec] hover:text-[#f5a623] whitespace-nowrap overflow-hidden text-ellipsis"
                      onClick={() => setMegaOpen(false)}
                    >
                      {getCategoryName(cat)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Buscador desktop */}
          <div className="relative hidden md:block flex-1 min-w-0 max-w-[480px]" ref={searchBoxRef}>
            <form className="flex max-w-[640px] items-center bg-[#2a2a2a] border-[1.5px] border-[#333] rounded-[10px] overflow-hidden transition-colors focus-within:border-[#f5a623]" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim().length >= 2) setSuggestOpen(true);
                }}
                className="flex-1 border-0 bg-transparent px-3.5 py-2 text-base outline-none text-white min-w-0 placeholder:text-[#555]"
                role="combobox"
                aria-expanded={suggestOpen}
                aria-autocomplete="list"
                aria-controls="navbar-search-suggestions"
              />
              <button
                type="submit"
                className="bg-[#f5a623] border-0 px-5 text-black cursor-pointer inline-flex items-center justify-center self-stretch shrink-0 hover:bg-[#d9901d]"
                aria-label="Buscar"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-black" />
              </button>
            </form>

            {suggestOpen && (search.trim().length >= 2 || loadingSuggest) && (
              <div
                className={suggestPanelClass(false)}
                id="navbar-search-suggestions"
                role="listbox"
              >
                {loadingSuggest ? (
                  <div className="p-3.5 text-[0.85rem] text-[#756a60]">Buscando productos...</div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full border-0 bg-white cursor-pointer flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[#faf6f1]"
                        onClick={() => handleSuggestionClick(item)}
                        role="option"
                      >
                        <div className="w-11 h-11 rounded-[10px] overflow-hidden bg-[#f3ede5] shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover block" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8c8177]">📦</div>
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col gap-[3px]">
                          <span className="text-[0.9rem] font-bold text-[#1f1a17] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                          <span className="text-[0.78rem] text-[#756a60]">
                            {item.category_name ?? "Sin categoría"} ·{" "}
                            {item.price > 0
                              ? `S/ ${item.price.toFixed(2)}`
                              : "Consultar"}
                          </span>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className="w-full border-0 bg-white cursor-pointer flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[#faf6f1] justify-center font-bold text-[#d2691e] border-t border-[#f2e7db]"
                      onClick={handleSearch as any}
                    >
                      Ver resultados para &quot;{search.trim()}&quot;
                    </button>
                  </>
                ) : (
                  <div className="p-3.5 text-[0.85rem] text-[#756a60]">
                    No encontramos coincidencias para &quot;{search.trim()}
                    &quot;
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <div className="hidden md:flex items-center gap-0.5 border-r border-[#2a2a2a] pr-2.5 mr-1">
              {socialUrls.instagram && (
                <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg no-underline transition-all hover:bg-[#2a2a2a]" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#igGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="url(#igGrad)" />
                  </svg>
                </a>
              )}
              {socialUrls.facebook && (
                <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg no-underline transition-all hover:bg-[#2a2a2a]" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {socialUrls.tiktok && (
                <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg no-underline transition-all hover:bg-[#2a2a2a]" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="url(#ttGrad)">
                    <defs>
                      <linearGradient id="ttGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2ea" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ff0050" />
                      </linearGradient>
                    </defs>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                  </svg>
                </a>
              )}
            </div>

            <button
              className="relative inline-flex items-center gap-2.5 border-0 bg-[#fff7f1] text-[#d2691e] px-4 py-2.5 font-extrabold cursor-pointer rounded-[10px] transition-all hover:bg-[#f5ede4] hover:-translate-y-px active:scale-[.98] duration-150 whitespace-nowrap"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              type="button"
            >
              <span className="relative w-[22px] h-[22px] inline-flex items-center justify-center shrink-0">
                <ShoppingCartIcon className="w-5 h-5" />
                {count > 0 && (
                  <span className={`absolute -top-[7px] -right-[9px] min-w-[18px] h-[18px] rounded-full bg-[#e05c2a] text-white inline-flex items-center justify-center text-[0.68rem] font-extrabold px-[5px] leading-none ${cartPop ? "cart-badge--pop" : ""}`}>
                    {count}
                  </span>
                )}
              </span>
              <span className="leading-none hidden md:inline">Carrito</span>
            </button>

            {/* ✅ FIX: authChecked garantiza que solo renderiza después de leer localStorage */}
            {authChecked && isLogged && isAdmin && (
              <>
                <Link
                  href="/admin/productos"
                  className="hidden md:inline-flex items-center justify-center gap-1 h-11 px-4 rounded-[10px] text-xs font-black tracking-[0.06em] cursor-pointer transition-all whitespace-nowrap shrink-0 no-underline uppercase bg-[#2a2a2a] text-[#f5a623] border-2 border-[#f5a623] hover:bg-[#f5a623] hover:text-[#1a1a1a]"
                >
                  <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                  PANEL
                </Link>

                <button
                  type="button"
                  className="hidden md:inline-flex items-center justify-center gap-1 h-11 px-4 rounded-[10px] text-xs font-black tracking-[0.06em] cursor-pointer transition-all whitespace-nowrap shrink-0 no-underline uppercase bg-[#c0392b] text-white border-2 border-[#c0392b] hover:bg-[#962d22] hover:border-[#962d22]"
                  onClick={handleLogout}
                >
                  SALIR
                </button>
              </>
            )}

            {/* ✅ FIX: El candado ahora sí aparece cuando no hay sesión activa */}
            {authChecked && !(isLogged && isAdmin) && (
              <button
                className="w-11 h-11 bg-[#2a2a2a] border-[1.5px] border-[#3a3a3a] rounded-[10px] text-[#aaaaaa] flex items-center justify-center cursor-pointer transition-all shrink-0 hover:bg-[#f5a623] hover:border-[#f5a623] hover:text-[#1a1a1a]"
                onClick={() => router.push("/login")}
                title="Acceso admin"
                aria-label="Panel de administrador"
                type="button"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block", flexShrink: 0 }}
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
              </button>
            )}

            <button
              className="flex md:hidden bg-transparent border-0 text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#2a2a2a]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
              type="button"
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
        </div>

        {mobileOpen && (
          <div className="bg-[#111] border-t border-[#2a2a2a] px-4 py-4 pb-6 max-h-[75vh] overflow-y-auto">
            <div className="relative">
              <form className="flex items-center bg-[#2a2a2a] border-[1.5px] border-[#333] rounded-[10px] overflow-hidden mb-5" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border-0 bg-transparent px-3.5 py-2.5 text-base outline-none text-white placeholder:text-[#555]"
                  autoFocus
                />
<button
                  type="submit"
                  className="bg-[#f5a623] border-0 px-5 text-black cursor-pointer inline-flex items-center justify-center self-stretch shrink-0 hover:bg-[#d9901d]"
                  aria-label="Buscar"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 text-black" />
                </button>
              </form>

              {suggestOpen && (search.trim().length >= 2 || loadingSuggest) && (
                <div className={suggestPanelClass(true)}>
                  {loadingSuggest ? (
                    <div className="p-3.5 text-[0.85rem] text-[#756a60]">
                      Buscando productos...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full border-0 bg-white cursor-pointer flex items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[#faf6f1]"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <div className="w-11 h-11 rounded-[10px] overflow-hidden bg-[#f3ede5] shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover block" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8c8177]">📦</div>
                            )}
                          </div>
                          <div className="min-w-0 flex flex-col gap-[3px]">
                            <span className="text-[0.9rem] font-bold text-[#1f1a17] whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.name}
                            </span>
                            <span className="text-[0.78rem] text-[#756a60]">
                              {item.category_name ?? "Sin categoría"} ·{" "}
                              {item.price > 0
                                ? `S/ ${item.price.toFixed(2)}`
                                : "Consultar"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-3.5 text-[0.85rem] text-[#756a60]">
                      No encontramos coincidencias para &quot;{search.trim()}
                      &quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-5">
              <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[#555] mt-0 mb-3">Páginas</p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/productos"
                  className="block px-3.5 py-2.5 text-[0.85rem] font-semibold text-[#cccccc] no-underline bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] transition-colors hover:bg-[#f5a623] hover:text-[#1a1a1a] hover:border-[#f5a623]"
                  onClick={() => setMobileOpen(false)}
                >
                  Nuestros productos
                </Link>
                <Link
                  href="/blog"
                  className="block px-3.5 py-2.5 text-[0.85rem] font-semibold text-[#cccccc] no-underline bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] transition-colors hover:bg-[#f5a623] hover:text-[#1a1a1a] hover:border-[#f5a623]"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/quienes-somos"
                  className="block px-3.5 py-2.5 text-[0.85rem] font-semibold text-[#cccccc] no-underline bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] transition-colors hover:bg-[#f5a623] hover:text-[#1a1a1a] hover:border-[#f5a623]"
                  onClick={() => setMobileOpen(false)}
                >
                  Quiénes Somos
                </Link>
                <Link
                  href="/contacto"
                  className="block px-3.5 py-2.5 text-[0.85rem] font-semibold text-[#cccccc] no-underline bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] transition-colors hover:bg-[#f5a623] hover:text-[#1a1a1a] hover:border-[#f5a623]"
                  onClick={() => setMobileOpen(false)}
                >
                  Contacto
                </Link>
              </div>
            </div>

            <div className="flex gap-2.5 border-t border-[#2a2a2a] pt-4 flex-wrap">
              {!isLogged && (
                <Link
                  href="/login"
                  className="text-[0.8rem] font-semibold text-[#888] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]"
                  onClick={() => setMobileOpen(false)}
                >
                  Ingresar Admin
                </Link>
              )}

              {isLogged && isAdmin && (
                <>
                  <Link
                    href="/admin/productos"
                    className="text-[0.8rem] font-semibold text-[#888] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel Admin
                  </Link>
                  <button
                    type="button"
                    className="text-[0.8rem] font-semibold text-[#dddddd] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </>
              )}

              {socialUrls.instagram && (
                <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="text-[0.8rem] font-semibold text-[#888] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]">Instagram</a>
              )}
              {socialUrls.facebook && (
                <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="text-[0.8rem] font-semibold text-[#888] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]">Facebook</a>
              )}
              {socialUrls.tiktok && (
                <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="text-[0.8rem] font-semibold text-[#888] no-underline transition-colors bg-transparent border-0 p-0 cursor-pointer hover:text-[#f5a623]">TikTok</a>
              )}
            </div>
          </div>
        )}
      </div>

      <SubNavbar />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}