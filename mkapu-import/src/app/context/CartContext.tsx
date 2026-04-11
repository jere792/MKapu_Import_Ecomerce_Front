"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Subset del producto necesario para recalcular tiers
export interface CartProduct {
  price: number;
  pricemCaja?: number;
  unidadcaja?: number;
  priceMayorista?: number;
  unidadMayorista?: number;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;        // precio unitario del tier activo (para mostrar "S/ X c/u")
  itemTotal: number;    // total real con lógica mixta cajas + sueltas
  emoji: string;
  qty: number;
  imageUrl?: string;
  product: CartProduct; // guardado para recalcular al cambiar qty desde cualquier lugar
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number | string) => void;
  updateQty: (id: number | string, qty: number) => void; // recalcula internamente
  clearCart: () => void;
  total: number;
  count: number;
}

// ── Helpers de cálculo (viven aquí para que el contexto sea autónomo) ──
function calcTier(qty: number, p: CartProduct): { price: number } {
  const hasCaja      = !!p.pricemCaja && !!p.unidadcaja;
  const hasMayorista = !!p.priceMayorista && !!p.unidadMayorista;

  if (hasCaja && qty >= p.unidadcaja!)
    return { price: p.pricemCaja! / p.unidadcaja! }; // precio por unidad dentro de la caja
  if (hasMayorista && qty >= p.unidadMayorista!)
    return { price: p.priceMayorista! };
  return { price: p.price };
}

function calcTotal(qty: number, p: CartProduct): number {
  if (qty <= 0) return 0;

  const hasCaja      = !!p.pricemCaja && !!p.unidadcaja;
  const hasMayorista = !!p.priceMayorista && !!p.unidadMayorista;

  if (hasCaja && qty >= p.unidadcaja!) {
    const cajas   = Math.floor(qty / p.unidadcaja!);
    const sueltas = qty % p.unidadcaja!;
    // Las sueltas van al precio mayorista si el total supera el umbral mayorista
    // (ya compraste suficiente para calificar, no importa que sean "sueltas")
    const precioSueltas =
      hasMayorista && qty >= p.unidadMayorista!
        ? p.priceMayorista!
        : p.price;
    return cajas * p.pricemCaja! + sueltas * precioSueltas;
  }

  if (hasMayorista && qty >= p.unidadMayorista!) {
    return qty * p.priceMayorista!;
  }

  return qty * p.price;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mkapu_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("mkapu_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty   = existing.qty + 1;
        const newPrice = calcTier(newQty, item.product).price;
        const newTotal = calcTotal(newQty, item.product);
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, qty: newQty, price: newPrice, itemTotal: newTotal }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id: number | string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Recalcula price e itemTotal usando el producto guardado — sin necesidad de pasarlos desde fuera
  const updateQty = (id: number | string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newPrice = calcTier(qty, i.product).price;
        const newTotal = calcTotal(qty, i.product);
        return { ...i, qty, price: newPrice, itemTotal: newTotal };
      })
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.itemTotal, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}