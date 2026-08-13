"use client";

import { useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { sendToWhatsApp } from "@/app/lib/whatsapp";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, updateQty, removeItem, total, count, setIsOpen } = useCart();

  // Sincroniza el estado del contexto con la prop open
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  return (
    <>
      <div
        className={`${open ? "block" : "hidden"} fixed inset-0 bg-black/45 z-[200]`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[201] flex flex-col translate-x-full transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-4px_0_24px_rgba(0,0,0,0.12)]${open ? " translate-x-0" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-line shrink-0">
          <h2 className="text-[17px] font-bold">🛒 Tu carrito</h2>
          <button
            className="bg-transparent border-0 text-2xl cursor-pointer text-muted leading-none px-1.5 py-0.5 rounded-md hover:bg-[#f0f0f0]"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted">
            <span className="text-[48px]">🛒</span>
            <p>Tu carrito está vacío</p>
            <button className="mt-2 px-6 py-2.5 bg-brand text-white border-0 rounded-[10px] text-sm font-bold cursor-pointer" onClick={onClose}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-3 list-none flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5 p-2.5 bg-bg rounded-[10px]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item__img"
                    />
                  ) : (
                    <span className="text-[28px] w-[46px] h-[46px] bg-white rounded-lg flex items-center justify-center shrink-0">{item.emoji}</span>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      S/ {item.price.toFixed(2)} c/u ·{" "}
                      <strong>S/ {item.itemTotal.toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      className="w-6 h-6 rounded-full border-[1.5px] border-brand bg-transparent text-brand-dark text-sm font-bold cursor-pointer flex items-center justify-center hover:bg-brand-light"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Reducir"
                    >
                      −
                    </button>
                    <span className="text-[13px] font-bold min-w-[18px] text-center">{item.qty}</span>
                    <button
                      className="w-6 h-6 rounded-full border-[1.5px] border-brand bg-transparent text-brand-dark text-sm font-bold cursor-pointer flex items-center justify-center hover:bg-brand-light"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="bg-transparent border-0 text-[#ccc] text-[13px] cursor-pointer p-1 rounded shrink-0 hover:text-[#e24b4a]"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Quitar ${item.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="px-5 py-4 border-t border-line shrink-0">
              <div className="flex justify-between items-center text-[15px] mb-3.5 [&_strong]:text-[18px]">
                <span>
                  Total ({count} producto{count !== 1 ? "s" : ""})
                </span>
                <strong>S/ {total.toFixed(2)}</strong>
              </div>
              <button
                className="w-full py-3.5 bg-whatsapp text-white border-0 rounded-xl text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2.5 transition-colors hover:bg-whatsapp-dark"
                onClick={() => sendToWhatsApp(items)}
              >
                <WspIcon />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>

    </>
  );
}

function WspIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#fff"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}