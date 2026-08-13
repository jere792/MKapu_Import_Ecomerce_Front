"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImageOff,
  MessageCircle,
  ShoppingCart,
  Tag,
  ChevronLeft,
  ChevronRight,
  Play,
  Truck,
  Store,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import type { Producto } from "@/lib/supabase";

interface Props {
  producto: Producto & { category_name?: string | null };
  sugeridos: any[];
  promocionesMap: Record<number, { tipo_descuento: string; valor_descuento: number }>;
}

type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
};

type ProductoVideo = {
  id: number;
  producto_id: number;
  video_url: string | null;
  titulo: string | null;
  orden: number;
};

function formatPrice(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function calcDescuento(
  price: number,
  promo: { tipo_descuento: string; valor_descuento: number } | undefined,
): { precioFinal: number; descuentoTexto: string } | null {
  if (!promo) return null;
  let d = promo.tipo_descuento === "porcentaje"
    ? (price * promo.valor_descuento) / 100
    : promo.valor_descuento;
  const precioFinal = Math.max(0, price - d);
  const descuentoTexto = promo.tipo_descuento === "porcentaje"
    ? `${promo.valor_descuento}% OFF`
    : `S/ ${promo.valor_descuento.toFixed(2)} OFF`;
  return { precioFinal, descuentoTexto };
}

const cardBase = "bg-white/90 border border-[rgba(234,223,206,0.9)] shadow-[0_16px_40px_rgba(78,52,24,0.08)] backdrop-blur-[10px]";

export default function ProductoDetailClient({ producto, sugeridos, promocionesMap }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [videos, setVideos] = useState<ProductoVideo[]>([]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const cartItem = items.find((item) => item.id === String(producto.id));
  const qty = cartItem?.qty ?? 0;
  const isConsult = producto.price === 0;
  const isAgotado = producto.agotado === true;
  const descuento = calcDescuento(producto.price, promocionesMap[producto.id]);
  const precioFinal = descuento ? descuento.precioFinal : producto.price;
  const tieneDescuento = descuento && precioFinal < producto.price;
  const categoryLabel =
    producto.category_name || `Categoría ${producto.category}`;

  useEffect(() => {
    async function loadMedia() {
      const [imgRes, vidRes] = await Promise.all([
        supabase
          .from("producto_imagenes")
          .select("*")
          .eq("producto_id", producto.id)
          .order("orden"),
        supabase
          .from("producto_videos")
          .select("*")
          .eq("producto_id", producto.id)
          .order("orden"),
      ]);

      setImagenes(imgRes.data ?? []);
      setVideos(vidRes.data ?? []);
    }

    loadMedia();
  }, [producto.id]);

  const allMedia = [
    ...(producto.image_url
      ? [{ type: "main" as const, url: producto.image_url, titulo: null }]
      : []),
    ...imagenes.map((img) => ({
      type: "image" as const,
      url: img.url_imagenes,
      titulo: null,
    })),
    ...videos.map((vid) => ({
      type: "video" as const,
      url: vid.video_url,
      titulo: vid.titulo,
    })),
  ];

  const currentMedia = allMedia[activeMediaIdx];
  const hasMultipleMedia = allMedia.length > 1;
  const totalPrice = qty * precioFinal;

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) {
      removeItem(String(producto.id));
      return;
    }
    updateQty(String(producto.id), newQty);
  }
  function handleAdd() {
    if (isAgotado) return;
    addItem({
      id: String(producto.id),
      code: producto.code ?? "",
      name: producto.name,
      price: precioFinal,
      itemTotal: precioFinal,
      imageUrl: producto.image_url ?? undefined,
      emoji: "📦",
      product: {
        price: precioFinal,
      },
    });
  }

  function prevMedia() {
    setActiveMediaIdx((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  }

  function nextMedia() {
    setActiveMediaIdx((i) => (i === allMedia.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 pt-6 pb-14 text-[#1f1a17] max-[720px]:px-3.5 max-[720px]:pb-[42px] max-[720px]:pt-[18px]">
      <div className="mb-[18px]">
        <Link href="/productos" className="inline-flex items-center gap-2.5 w-fit px-3.5 py-2.5 rounded-full border border-[#e6dccf] bg-white/86 text-[#4d5b67] text-[0.92rem] font-semibold transition-[transform,border-color,background,color] duration-[0.18s] hover:-translate-y-px hover:border-[#d7c6b0] hover:bg-white hover:text-[#e05c2a] max-[520px]:text-[0.86rem]">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f6efe7] shrink-0" aria-hidden="true">
            <ArrowLeft size={18} />
          </span>
          <span>Volver a productos</span>
        </Link>
      </div>

      <section className="grid grid-cols-[minmax(320px,520px)_minmax(0,1fr)] gap-7 items-start max-[1080px]:grid-cols-1">
        <div className="relative self-start max-[1080px]:static">
          <div className="sticky top-[98px] p-[18px] rounded-[28px] bg-[linear-gradient(180deg,#fffaf3_0%,#ffffff_100%)] border border-[rgba(234,223,206,0.9)] shadow-[0_16px_40px_rgba(78,52,24,0.08)] backdrop-blur-[10px] max-[1080px]:static max-[720px]:rounded-[22px]">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-3 py-2 rounded-full text-[0.78rem] font-bold uppercase tracking-[0.06em] bg-white border border-[#ebdfcf] text-[#6b625b]">
                {categoryLabel}
              </span>

              {isAgotado && (
                <span className="text-[0.7rem] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-[0.04em] bg-[#1a1a1a] text-white">
                  Agotado
                </span>
              )}

              {producto.is_new && !isAgotado && (
                <span className="text-[0.7rem] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-[0.04em] bg-amber-500 text-white">Nuevo</span>
              )}

              {producto.featured && !isAgotado && (
                <span className="text-[0.7rem] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-[0.04em] bg-emerald-500 text-white">
                  Destacado
                </span>
              )}
            </div>

            <div
              className={`aspect-square min-h-0 transition-[aspect-ratio] duration-200 rounded-[22px] overflow-hidden relative bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f2ece5_55%,#ebe4db_100%)] border border-[#ece3d7]${currentMedia?.type === "video" ? " !aspect-auto !max-h-[500px] !h-[500px]" : ""}`}
            >
              {currentMedia && currentMedia.url && !imgError ? (
                currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    className="w-auto h-full max-w-full object-contain block bg-black mx-auto static transform-none"
                    key={currentMedia.url}
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={producto.name}
                    className="w-auto h-full max-w-full object-contain block bg-black mx-auto static transform-none"
                    onError={() => setImgError(true)}
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#b4aaa3] text-[0.95rem]">
                  <ImageOff size={48} strokeWidth={1.6} />
                  <span>Imagen no disponible</span>
                </div>
              )}
              {hasMultipleMedia && (
                <>
                  <button
                    className="absolute top-1/2 -translate-y-1/2 left-3 w-10 h-10 rounded-full border-none bg-white/92 text-[#1a1a1a] flex items-center justify-center cursor-pointer z-[2] backdrop-blur-[4px] transition-[background,transform] duration-150 hover:bg-white hover:scale-[1.08]"
                    onClick={prevMedia}
                    aria-label="Anterior"
                    type="button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="absolute top-1/2 -translate-y-1/2 right-3 w-10 h-10 rounded-full border-none bg-white/92 text-[#1a1a1a] flex items-center justify-center cursor-pointer z-[2] backdrop-blur-[4px] transition-[background,transform] duration-150 hover:bg-white hover:scale-[1.08]"
                    onClick={nextMedia}
                    aria-label="Siguiente"
                    type="button"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleMedia && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 mt-3">
                {allMedia.map((media, i) => (
                  <button
                    key={i}
                    className={`aspect-square rounded-xl overflow-hidden border-2 border-[#e8dfd3] bg-[#f9f6f2] cursor-pointer p-0 transition-[border-color,transform] duration-150 hover:scale-[1.04] hover:border-[#d7c6b0]${
                      i === activeMediaIdx ? " border-[#e05c2a]" : ""
                    }`}
                    onClick={() => setActiveMediaIdx(i)}
                    type="button"
                  >
                    {media.type === "video" ? (
                      <div className="w-full h-full relative overflow-hidden">
                        <video
                          src={media.url || ""}
                          muted
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <Play size={24} color="#fff" />
                        </div>
                      </div>
                    ) : media.url ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover block" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#b4aaa3]">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#e05c2a]">Detalle del producto</div>
            <h1 className="text-[clamp(2rem,4vw,3.3rem)] leading-[1.04] tracking-[-0.03em] m-0 max-[720px]:text-[1.9rem]">{producto.name}</h1>
            <p className="max-w-[70ch] text-[#72675f] text-base leading-[1.7] m-0">
              {producto.description ||
                "Este producto no tiene descripción por ahora."}
            </p>

            {producto.low_stock && (
              <div className="flex items-start gap-3.5 px-[18px] py-4 rounded-[16px] bg-[linear-gradient(135deg,#fff1f2_0%,#ffe4e6_100%)] border-[1.5px] border-[#fecdd3] mt-2 animate-[stock-pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite] max-[720px]:px-4 max-[720px]:py-3.5 max-[720px]:gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#fef2f2] border-2 border-[#fca5a5] flex items-center justify-center text-[#dc2626] animate-[icon-shake_3s_ease-in-out_infinite] max-[720px]:w-8 max-[720px]:h-8">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 flex-1 [&_strong]:text-[0.94rem] [&_strong]:text-[#991b1b] [&_strong]:font-extrabold [&_strong]:leading-[1.3] [&_span]:text-[0.84rem] [&_span]:text-[#b91c1c] [&_span]:leading-[1.5] max-[720px]:[&_strong]:text-[0.88rem] max-[720px]:[&_span]:text-[0.8rem]">
                  <strong>¡Últimas unidades disponibles!</strong>
                  <span>Este producto se está agotando. Aprovecha ahora.</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
            {producto.code && (
              <div className="p-4 rounded-[18px] bg-white border border-[#ece3d6] shadow-[0_10px_24px_rgba(59,41,17,0.05)] min-h-[94px] flex flex-col justify-between gap-2 [&_strong]:text-[0.98rem] [&_strong]:leading-[1.35]">
                <span className="text-[0.76rem] uppercase tracking-[0.08em] text-[#95877d] font-bold">Código</span>
                <strong>{producto.code}</strong>
              </div>
            )}

            <div className="p-4 rounded-[18px] bg-white border border-[#ece3d6] shadow-[0_10px_24px_rgba(59,41,17,0.05)] min-h-[94px] flex flex-col justify-between gap-2 [&_strong]:text-[0.98rem] [&_strong]:leading-[1.35]">
              <span className="text-[0.76rem] uppercase tracking-[0.08em] text-[#95877d] font-bold">Categoría</span>
              <strong>{categoryLabel}</strong>
            </div>
          </div>

          <div className={`${cardBase} rounded-3xl p-[22px] max-[720px]:rounded-[22px]`}>
            <div className="flex items-start justify-between gap-3 mb-4 [&_h2]:text-[1.08rem] [&_h2]:m-0 max-[720px]:flex-col max-[720px]:items-stretch">
              <h2>Precio</h2>
            </div>

            <div className="flex items-center justify-between p-[18px] rounded-[16px] bg-[linear-gradient(180deg,#ffffff_0%,#fcfaf7_100%)] border border-[#ece2d6]">
              <div className="flex items-center gap-2.5 text-[0.92rem] font-semibold text-[#1f1a17]">
                <Tag size={16} />
                Precio por unidad
              </div>
              <div className="text-[1.5rem] font-black text-[#e05c2a] flex items-center gap-2.5 flex-wrap">
                {isConsult ? (
                  "Consultar"
                ) : tieneDescuento ? (
                  <>
                    <span className="text-base font-semibold text-[#999] line-through">
                      {formatPrice(producto.price)}
                    </span>
                    <span className="text-[1.5rem] font-black text-[#e05c2a]">
                      {formatPrice(precioFinal)}
                    </span>
                    <span className="text-[0.72rem] font-extrabold bg-[#dc2626] text-white px-2.5 py-0.5 rounded-md tracking-[0.04em]">
                      {descuento!.descuentoTexto}
                    </span>
                  </>
                ) : (
                  formatPrice(producto.price)
                )}
              </div>
            </div>
          </div>

          <div className={`${cardBase} rounded-3xl p-[22px] max-[720px]:rounded-[22px]`}>
            <div className="flex items-start justify-between gap-3 mb-4 [&_h2]:text-[1.08rem] [&_h2]:m-0 max-[720px]:flex-col max-[720px]:items-stretch">
              <h2>Compra</h2>
              {qty > 0 && (
                <span className="text-[0.92rem] text-[#4d5b67] font-bold">
                  Total: {formatPrice(totalPrice)}
                </span>
              )}
            </div>

            {isAgotado ? (
              <div className="w-full min-h-[54px] rounded-[16px] inline-flex items-center justify-center gap-2 px-[18px] py-3.5 bg-[#fafafa] text-[#999] text-[0.95rem] font-semibold border border-dashed border-[#d1d5db]">
                <span className="inline-flex items-center justify-center w-6 h-6 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </span>
                Producto agotado
              </div>
            ) : qty === 0 ? (
              <button
                className={`w-full min-h-[54px] border-none rounded-[16px] inline-flex items-center justify-center gap-2.5 px-[18px] py-3.5 text-white text-[0.98rem] font-bold cursor-pointer shadow-[0_14px_28px_rgba(224,92,42,0.22)] transition-[transform,box-shadow,filter] duration-[0.18s] hover:-translate-y-0.5 hover:saturate-[1.05] hover:shadow-[0_18px_32px_rgba(224,92,42,0.28)] ${isConsult ? "bg-[linear-gradient(135deg,#25d366_0%,#18b957_100%)] shadow-[0_14px_28px_rgba(37,211,102,0.22)]" : "bg-[linear-gradient(135deg,#e05c2a_0%,#f07a4c_100%)]"}`}
                onClick={handleAdd}
                type="button"
              >
                {isConsult ? (
                  <>
                    <MessageCircle size={18} />
                    Agregar para consultar
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Agregar al carrito - {formatPrice(precioFinal)}
                  </>
                )}
              </button>
            ) : (
              <div className="grid grid-cols-[56px_1fr_56px] gap-3 items-center p-2.5 rounded-[18px] bg-[#f8f5f1] border border-[#ece2d6] max-[520px]:grid-cols-[48px_1fr_48px]">
                <button
                  className="min-h-14 border border-[#e6dbcf] rounded-[14px] bg-white text-[#1f1a17] text-[1.5rem] font-bold cursor-pointer transition-[background,color,border-color] duration-[0.18s] hover:bg-[#e05c2a] hover:text-white hover:border-[#e05c2a] max-[520px]:min-h-12"
                  onClick={() => handleUpdateQty(qty - 1)}
                  aria-label="Disminuir cantidad"
                  type="button"
                >
                  -
                </button>

                <div className="flex flex-col items-center justify-center gap-[5px] text-center min-h-14">
                  <strong className="text-base">
                    {qty} unidades
                  </strong>
                  <span className="text-[0.8rem] font-bold text-[#e05c2a]">
                    {tieneDescuento ? formatPrice(precioFinal) : formatPrice(producto.price)} c/u
                  </span>
                </div>

                <button
                  className="min-h-14 border border-[#e6dbcf] rounded-[14px] bg-white text-[#1f1a17] text-[1.5rem] font-bold cursor-pointer transition-[background,color,border-color] duration-[0.18s] hover:bg-[#e05c2a] hover:text-white hover:border-[#e05c2a] max-[520px]:min-h-12"
                  onClick={() => handleUpdateQty(qty + 1)}
                  aria-label="Aumentar cantidad"
                  type="button"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Opciones de entrega */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#f5f7fa] border border-[#e6eaf0]">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#e2e8f0] text-[#475569] shrink-0">
                <Truck size={22} />
              </div>
              <span className="text-[0.92rem] font-semibold text-[#1e293b]">Disponible envío a domicilio</span>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] bg-[#f5f7fa] border border-[#e6eaf0]">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#e2e8f0] text-[#475569] shrink-0">
                <Store size={22} />
              </div>
              <span className="text-[0.92rem] font-semibold text-[#1e293b]">Disponible retiro en tienda</span>
            </div>
          </div>
        </div>
      </section>

      {sugeridos.length > 0 && (
        <section className="mt-12 pt-8 border-t border-[#ece3d6]">
          <h2 className="text-[1.1rem] font-extrabold text-[#1a1a1a] mb-5">
            También te puede interesar
          </h2>
          <div className="flex gap-4 overflow-x-auto [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sugeridos.map((p) => {
              const d = calcDescuento(p.price, promocionesMap[p.id]);
              const pf = d ? d.precioFinal : p.price;
              return (
                <a
                  key={p.id}
                  href={`/productos/${p.id}`}
                  className="group flex-[0_0_180px] [scroll-snap-align:start] no-underline text-inherit cursor-pointer"
                >
                  <div className="aspect-square bg-[#f5f2ee] rounded-xl overflow-hidden mb-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[0.7rem] text-[#bbb]">Sin imagen</div>
                    )}
                  </div>
                  <div className="px-0.5">
                    <p className="text-[0.88rem] font-bold text-[#1a1a1a] mb-[3px] flex items-center gap-1.5 flex-wrap">
                      {p.price === 0 ? "Consultar" : d ? (
                        <>
                          <span className="text-[0.75rem] font-semibold text-[#999] line-through">S/ {p.price.toFixed(2)}</span>
                          <span>S/ {pf.toFixed(2)}</span>
                        </>
                      ) : `S/ ${p.price.toFixed(2)}`}
                    </p>
                    <p className="text-[0.78rem] text-[#555] leading-[1.3] line-clamp-2">{p.name}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}