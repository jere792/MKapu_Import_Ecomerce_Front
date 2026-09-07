"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number;
  code: string;
  name: string;
  category: number | null;
  category_name?: string;
  description: string;
  price: number;
  featured: boolean;
  is_new?: boolean;
  low_stock?: boolean;
  agotado?: boolean;
  image_url?: string;
  descuento?: { tipo_descuento: string; valor_descuento: number };
}

interface Props {
  product: Product;
  revealDelay?: number;
}

export default function ProductCard({ product, revealDelay = 0 }: Props) {
  const router = useRouter();
  const { addItem, items, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRevealed(true);
          obs.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1200);
    return () => clearTimeout(t);
  }, [justAdded]);

  const cartItem = items.find((i) => i.id === String(product.id));
  const isAgotado = product.agotado === true;
  const inCart = !!cartItem;
  const hasImage = !!product.image_url && !imgError;
  const isConsult = product.price === 0;

  const descuento = product.descuento;
  let precioFinal = product.price;
  let descuentoTexto = "";
  if (descuento && !isAgotado) {
    if (descuento.tipo_descuento === "porcentaje") {
      precioFinal = product.price * (1 - descuento.valor_descuento / 100);
      descuentoTexto = `${descuento.valor_descuento}% OFF`;
    } else {
      precioFinal = Math.max(0, product.price - descuento.valor_descuento);
      descuentoTexto = `-S/${descuento.valor_descuento.toFixed(2)}`;
    }
  }
  const tieneDescuento = !!descuento && precioFinal < product.price;

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isAgotado) return;
    if (inCart) {
      removeItem(String(product.id));
    } else {
      addItem({
        id: String(product.id),
        code: product.code,
        name: product.name,
        price: product.price,
        itemTotal: product.price,
        imageUrl: product.image_url,
        emoji: "📦",
        product: { price: product.price },
      });
      setJustAdded(true);
    }
  }

  // Badge base compartido
  const badgeBase: React.CSSProperties = {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "3px 8px",
    borderRadius: "3px",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    color: "#fff",
    lineHeight: 1.4,
  };

  const topTags = [
    product.is_new && {
      key: "new",
      label: "Nuevo",
      style: { ...badgeBase, background: "#f59e0b" },
    },
    product.low_stock &&
      !isAgotado && {
        key: "low",
        label: "Últimas unidades",
        style: { ...badgeBase, background: "#b91c1c" },
      },
    isAgotado && {
      key: "agotado",
      label: "Agotado",
      style: { ...badgeBase, background: "#1a1a1a" },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    style: React.CSSProperties;
  }[];

  return (
    <article
      ref={ref as any}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="pc-card"
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #ede8e1",
        borderRadius: "14px",
        overflow: "hidden",
        position: "relative",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 340ms ease ${Math.min(revealDelay, 200)}ms, transform 340ms ease ${Math.min(revealDelay, 200)}ms, border-color 200ms ease, box-shadow 220ms ease, translate 200ms ease`,
        willChange: revealed ? "auto" : "opacity, transform",
      }}
    >
      <style>{`
        .pc-card:hover{border-color:#e8ddd0;box-shadow:0 8px 22px rgba(78,52,24,.08);transform:translateY(-2px)}
        .pc-card:active{transform:translateY(0) scale(.985);box-shadow:0 2px 8px rgba(78,52,24,.06)}
        .pc-card:focus-visible{outline:2px solid #f5a623;outline-offset:2px}
        .pc-heart{transition:background 180ms ease, transform 180ms ease, color 180ms ease, box-shadow 180ms ease}
        .pc-heart:hover{transform:scale(1.06);box-shadow:0 4px 14px rgba(0,0,0,.12)}
        .pc-heart:active{transform:scale(.92)}
        @media (prefers-reduced-motion: reduce){
          .pc-card{transition:none!important;opacity:1!important;transform:none!important}
          .pc-card:hover{transform:none!important;box-shadow:none!important}
          .pc-heart{transition:none!important}
        }
      `}</style>
      {/* ── Imagen ── */}
      <div
        style={{
          position: "relative",
          background: "#f5f5f5",
          aspectRatio: "1/1",
          overflow: "hidden",
        }}
      >
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 220ms ease",
              transform: hovered ? "scale(1.02)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
            }}
          >
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Corazón / add feedback */}
        <button
          onClick={handleHeartClick}
          disabled={isAgotado}
          aria-label={inCart ? "Quitar del carrito" : "Agregar al carrito"}
          className="pc-heart"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: inCart ? "#fff1ec" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isAgotado ? "not-allowed" : "pointer",
            color: inCart ? "#e05c2a" : "#1a1a1a",
            opacity: isAgotado ? 0.3 : 1,
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          {justAdded && !isAgotado ? (
            <Check size={18} strokeWidth={2.5} />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={inCart ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        {/* ✅ Tags arriba-izquierda — fila horizontal, se envuelven si no caben */}
        {topTags.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              // Deja espacio para el corazón (36px botón + 10px right + 6px gap = 52px)
              maxWidth: "calc(100% - 62px)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "4px",
              zIndex: 2,
            }}
          >
            {topTags.map(({ key, label, style }) => (
              <span key={key} style={style}>
                {label}
              </span>
            ))}
          </div>
        )}

        {/* ✅ Badge promoción — abajo izquierda, más visible */}
        {tieneDescuento && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              zIndex: 2,
            }}
          >
            <span
              style={{
                ...badgeBase,
                background: "#dc2626",
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(220,38,38,0.5)",
                letterSpacing: "0.06em",
              }}
            >
              {descuentoTexto}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 4px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {isConsult ? (
            "Consultar"
          ) : tieneDescuento ? (
            <>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#999",
                  textDecoration: "line-through",
                  fontWeight: 500,
                }}
              >
                S/ {product.price.toFixed(2)}
              </span>
              <span style={{ color: "#dc2626" }}>
                S/ {precioFinal.toFixed(2)}
              </span>
            </>
          ) : (
            `S/ ${product.price.toFixed(2)}`
          )}
        </p>

        <h3
          style={{
            fontSize: "0.82rem",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: "0 0 3px",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: "0.75rem",
            color: "#767677",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {product.category_name ?? ""}
        </p>
      </div>
    </article>
  );

  function handleCardClick() {
    router.push(`/productos/${product.id}`);
  }
}
