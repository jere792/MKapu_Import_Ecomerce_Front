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
        className={`cart-backdrop${open ? " cart-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`cart-drawer${open ? " cart-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">🛒 Tu carrito</h2>
          <button
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <span className="cart-drawer__empty-icon">🛒</span>
            <p>Tu carrito está vacío</p>
            <button className="cart-drawer__browse-btn" onClick={onClose}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item__img"
                    />
                  ) : (
                    <span className="cart-item__emoji">{item.emoji}</span>
                  )}

                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__price">
                      S/ {item.price.toFixed(2)} c/u ·{" "}
                      <strong>S/ {item.itemTotal.toFixed(2)}</strong>
                    </p>
                  </div>

                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Reducir"
                    >
                      −
                    </button>
                    <span className="cart-item__qty-val">{item.qty}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Quitar ${item.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__total">
                <span>
                  Total ({count} producto{count !== 1 ? "s" : ""})
                </span>
                <strong>S/ {total.toFixed(2)}</strong>
              </div>
              <button
                className="cart-drawer__wsp-btn"
                onClick={() => sendToWhatsApp(items)}
              >
                <WspIcon />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>

      <style jsx>{`
        .cart-item__img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
          border: 1px solid #ede8e1;
        }
        .cart-item__emoji {
          font-size: 1.6rem;
          width: 44px;
          text-align: center;
          flex-shrink: 0;
        }
      `}</style>
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