"use client";

import { useState } from "react";
import { Heart, ShoppingCart, MessageCircle, ImageOff } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  old_price?: number;
  price_caja?: number;
  unidad_caja?: number;
  price_mayorista?: number;
  unidad_mayorista?: number;
  featured: boolean;
  image_url?: string;
}
interface Props {
  product: Product;
}

// ── Precio unitario del tier activo ──
function calcTier(qty: number, p: Product): { price: number; tier: "caja" | "mayorista" | "unidad" } {
  const hasCaja      = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!)
    return { price: p.price_caja! / p.unidad_caja!, tier: "caja" };
  if (hasMayorista && qty >= p.unidad_mayorista!)
    return { price: p.price_mayorista!, tier: "mayorista" };
  return { price: p.price, tier: "unidad" };
}

// ── Total real: cajas completas + unidades sueltas ──
function calcTotal(qty: number, p: Product): number {
  if (qty <= 0) return 0;

  const hasCaja      = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!) {
    const cajas   = Math.floor(qty / p.unidad_caja!);
    const sueltas = qty % p.unidad_caja!;
    const precioSueltas =
      hasMayorista && qty >= p.unidad_mayorista!
        ? p.price_mayorista!
        : p.price;
    return cajas * p.price_caja! + sueltas * precioSueltas;
  }

  if (hasMayorista && qty >= p.unidad_mayorista!) {
    return qty * p.price_mayorista!;
  }

  return qty * p.price;
}

export default function ProductCard({ product }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]           = useState(false);
  const [imgError, setImgError]     = useState(false);

  const cartItem = items.find((i) => i.id === String(product.id));
  const qty      = cartItem?.qty ?? 0;
  const hasImage = !!product.image_url && !imgError;

  const hasCaja      = !!product.price_caja && !!product.unidad_caja;
  const hasMayorista = !!product.price_mayorista && !!product.unidad_mayorista;
  const isConsult    = product.price === 0 && !hasCaja && !hasMayorista;

  const { price: activePriceCart, tier: activeTier } = calcTier(qty, product);
  const { price: activePriceNext }                   = calcTier(qty + 1, product);

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) { removeItem(String(product.id)); return; }
    updateQty(String(product.id), newQty); // el contexto recalcula internamente
  }

  function handleAdd() {
    const { price } = calcTier(1, product);
    const itemTotal = calcTotal(1, product);
    addItem({
      id:       String(product.id),
      name:     product.name,
      price,
      itemTotal,
      imageUrl: product.image_url,
      emoji:    "📦",
      product: {                   // ← guardamos los datos de precio para recalcular
        price:              product.price,
        price_caja:         product.price_caja,
        unidad_caja:        product.unidad_caja,
        price_mayorista:    product.price_mayorista,
        unidad_mayorista:   product.unidad_mayorista,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  const tierLabel =
    activeTier === "caja"      ? `Precio caja (×${product.unidad_caja} und.)` :
    activeTier === "mayorista" ? `Precio mayorista (≥${product.unidad_mayorista} und.)` :
    "Precio por unidad";

  return (
    <article className={`pcard${added ? " pcard--pop" : ""}`}>

      {/* IMAGEN */}
      <div className="pcard__media">
        {hasImage ? (
          <img src={product.image_url} alt={product.name} className="pcard__img" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="pcard__no-img"><ImageOff size={28} strokeWidth={1.5} /><span>Sin imagen</span></div>
        )}
        <button className={`pcard__wish${wishlisted ? " pcard__wish--on" : ""}`} onClick={() => setWishlisted(v => !v)} aria-label="Favorito">
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        {qty > 0 && (
          <span className={`pcard__qty-badge pcard__qty-badge--${activeTier}`}>{qty}</span>
        )}
      </div>

      {/* INFO */}
      <div className="pcard__body">
        <p className="pcard__cat">{product.category.replace(/-/g, " ")}</p>
        <h3 className="pcard__name">{product.name}</h3>
        <p className="pcard__desc">{product.description || "\u00a0"}</p>
      </div>

      {/* PRECIOS — 3 filas fijas */}
      <div className="pcard__tiers">

        {/* Unidad */}
        <div className={`pcard__tier${activeTier === "unidad" && qty > 0 ? " pcard__tier--on" : ""}`}>
          <span className="pcard__tier-lbl">Por unidad</span>
          <span className="pcard__tier-price">
            {isConsult ? "Consultar" : `S/ ${product.price.toFixed(2)}`}
          </span>
        </div>

        {/* Mayorista */}
        <div className={`pcard__tier${activeTier === "mayorista" && qty > 0 ? " pcard__tier--on pcard__tier--blue" : ""}${!hasMayorista ? " pcard__tier--ghost" : ""}`}>
          <span className="pcard__tier-lbl">
            Por mayor
            {hasMayorista && <em>desde {product.unidad_mayorista} und.</em>}
          </span>
          <span className="pcard__tier-price pcard__tier-price--blue">
            {hasMayorista ? `S/ ${product.price_mayorista!.toFixed(2)}` : "—"}
          </span>
        </div>

        {/* Caja */}
        <div className={`pcard__tier${activeTier === "caja" && qty > 0 ? " pcard__tier--on pcard__tier--green" : ""}${!hasCaja ? " pcard__tier--ghost" : ""}`}>
          <span className="pcard__tier-lbl">
            Caja
            {hasCaja && <em>× {product.unidad_caja} und.</em>}
          </span>
          <span className="pcard__tier-price pcard__tier-price--green">
            {hasCaja ? `S/ ${product.price_caja!.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>

      {/* BOTÓN / STEPPER */}
      <div className="pcard__actions">
        {qty === 0 ? (
          <button className={`pcard__btn${isConsult ? " pcard__btn--wsp" : ""}`} onClick={handleAdd}>
            {isConsult
              ? <><MessageCircle size={15} /> Agregar para consultar</>
              : <><ShoppingCart size={15} /> Agregar — S/ {activePriceNext.toFixed(2)}</>
            }
          </button>
        ) : (
          <div className="pcard__stepper">
            <button className="pcard__step" onClick={() => handleUpdateQty(qty - 1)}>−</button>
            <div className="pcard__step-info">
              <span className="pcard__step-qty">{qty} und.</span>
              <span className={`pcard__step-tier pcard__step-tier--${activeTier}`}>{tierLabel}</span>
            </div>
            <button className="pcard__step" onClick={() => handleUpdateQty(qty + 1)}>+</button>
          </div>
        )}
      </div>

      {/* Aviso de próximo tier */}
      {qty > 0 && activeTier !== "caja" && (hasMayorista || hasCaja) && (() => {
        const nextThreshold = activeTier === "unidad" && hasMayorista
          ? product.unidad_mayorista! - qty
          : hasCaja ? product.unidad_caja! - qty : null;
        const nextPrice = activeTier === "unidad" && hasMayorista
          ? product.price_mayorista!
          : hasCaja ? product.price_caja! : null;
        const nextName = activeTier === "unidad" && hasMayorista ? "mayorista" : "caja";
        if (!nextThreshold || nextThreshold <= 0 || !nextPrice) return null;
        return (
          <div className={`pcard__hint pcard__hint--${nextName}`}>
            +{nextThreshold} más → precio {nextName} S/ {nextPrice.toFixed(2)}
          </div>
        );
      })()}

      <style jsx>{`
        .pcard {
          --accent:#e05c2a; --accent-h:#c44d20; --accent-bg:#fff1ec;
          --wsp:#25d366; --wsp-h:#1da851;
          --blue:#0891b2; --blue-bg:#e0f2fe;
          --green:#16a34a; --green-bg:#dcfce7;
          --text:#1a1a1a; --muted:#999; --border:#ede8e1;

          display: grid;
          grid-template-rows: 170px auto 126px 52px;
          height: 100%;
          background:#fff;
          border:1px solid var(--border);
          border-radius:16px;
          box-shadow:0 2px 10px rgba(0,0,0,0.06);
          overflow:hidden;
          transition:box-shadow 0.22s, transform 0.22s;
          position: relative;
        }
        .pcard:hover { box-shadow:0 10px 32px rgba(0,0,0,0.13); transform:translateY(-4px); }
        .pcard--pop { animation:pop 0.3s cubic-bezier(.36,.07,.19,.97); }
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 70%{transform:scale(.97)} 100%{transform:scale(1)} }

        .pcard__media { position:relative; background:#f5f2ee; overflow:hidden; }
        .pcard__img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s; }
        .pcard:hover .pcard__img { transform:scale(1.06); }
        .pcard__no-img { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:#ccc; font-size:0.7rem; }

        .pcard__wish { position:absolute; top:9px; right:9px; width:30px; height:30px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#bbb; transition:color 0.15s,transform 0.15s; z-index:1; }
        .pcard__wish:hover { transform:scale(1.15); }
        .pcard__wish--on { color:#ef4444; }

        .pcard__qty-badge { position:absolute; bottom:7px; right:9px; font-size:0.6rem; font-weight:800; border-radius:99px; padding:2px 7px; border:2px solid #fff; z-index:1; animation:bdg .2s ease; }
        .pcard__qty-badge--unidad    { background:var(--accent); color:#fff; }
        .pcard__qty-badge--mayorista { background:var(--blue);   color:#fff; }
        .pcard__qty-badge--caja      { background:var(--green);  color:#fff; }
        @keyframes bdg { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }

        .pcard__body { padding:0.75rem 0.85rem 0.4rem; overflow:hidden; }
        .pcard__cat  { font-size:0.6rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:0 0 3px; }
        .pcard__name { font-size:0.86rem; font-weight:800; color:var(--text); margin:0 0 4px; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .pcard__desc { font-size:0.71rem; color:var(--muted); margin:0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        .pcard__tiers { display:flex; flex-direction:column; gap:0; border-top:1px solid var(--border); }
        .pcard__tier {
          display:flex; align-items:center; justify-content:space-between;
          height:42px; padding:0 0.85rem;
          border-bottom:1px solid var(--border);
          background:#fafaf9;
          gap:8px; transition:background 0.15s;
        }
        .pcard__tier:last-child { border-bottom:none; }
        .pcard__tier--on         { background:var(--accent-bg); }
        .pcard__tier--on.pcard__tier--blue  { background:var(--blue-bg); }
        .pcard__tier--on.pcard__tier--green { background:var(--green-bg); }
        .pcard__tier--ghost      { opacity:0.38; }

        .pcard__tier-lbl { display:flex; flex-direction:column; gap:1px; font-size:0.71rem; font-weight:600; color:var(--text); line-height:1.2; }
        .pcard__tier-lbl em { font-style:normal; font-size:0.62rem; color:var(--muted); font-weight:400; }
        .pcard__tier-price { font-size:0.83rem; font-weight:900; color:var(--text); white-space:nowrap; }
        .pcard__tier-price--blue  { color:var(--blue); }
        .pcard__tier-price--green { color:var(--green); }

        .pcard__actions { padding:7px 0.85rem; display:flex; align-items:center; }
        .pcard__btn { width:100%; display:flex; align-items:center; justify-content:center; gap:6px; height:38px; border-radius:10px; border:none; font-size:0.82rem; font-weight:700; cursor:pointer; background:var(--accent); color:#fff; transition:background .15s,transform .12s,box-shadow .15s; }
        .pcard__btn:hover { background:var(--accent-h); box-shadow:0 4px 12px rgba(224,92,42,.35); transform:translateY(-1px); }
        .pcard__btn:active { transform:scale(.97); }
        .pcard__btn--wsp { background:var(--wsp); }
        .pcard__btn--wsp:hover { background:var(--wsp-h); }

        .pcard__stepper { width:100%; display:flex; align-items:center; background:var(--accent-bg); border-radius:10px; overflow:hidden; height:38px; }
        .pcard__step { background:transparent; border:none; color:var(--accent); font-size:1.3rem; font-weight:700; width:36px; height:100%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s; }
        .pcard__step:hover { background:#fbd5c5; }
        .pcard__step-info { flex:1; display:flex; flex-direction:column; align-items:center; gap:1px; }
        .pcard__step-qty  { font-size:0.8rem; font-weight:800; color:var(--text); line-height:1; }
        .pcard__step-tier { font-size:0.58rem; font-weight:600; line-height:1; }
        .pcard__step-tier--unidad    { color:var(--accent); }
        .pcard__step-tier--mayorista { color:var(--blue); }
        .pcard__step-tier--caja      { color:var(--green); }

        .pcard__hint {
          position:absolute; bottom:52px; left:0; right:0;
          text-align:center; font-size:0.62rem; font-weight:700;
          padding:3px 8px; letter-spacing:0.02em;
          animation:hintIn 0.2s ease;
        }
        .pcard__hint--mayorista { background:var(--blue-bg);  color:var(--blue); }
        .pcard__hint--caja      { background:var(--green-bg); color:var(--green); }
        @keyframes hintIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </article>
  );
}