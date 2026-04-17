"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface CartProduct {
  price: number;
  price_caja?: number;
  unidad_caja?: number;
  price_mayorista?: number;
  unidad_mayorista?: number;
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  itemTotal: number;
  emoji: string;
  qty: number;
  imageUrl?: string;
  product: CartProduct;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number | string) => void;
  updateQty: (id: number | string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

function calcTier(qty: number, p: CartProduct): { price: number } {
  const hasCaja      = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!)           return { price: p.price_caja! / p.unidad_caja! };
  if (hasMayorista && qty >= p.unidad_mayorista!) return { price: p.price_mayorista! };
  return { price: p.price };
}

function calcTotal(qty: number, p: CartProduct): number {
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

  if (hasMayorista && qty >= p.unidad_mayorista!) return qty * p.price_mayorista!;
  return qty * p.price;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);   // ← línea que faltaba
  const [isOpen, setIsOpen] = useState(false);

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
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen }}
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