import { CartItem } from "../context/CartContext";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function normalizeWhatsAppNumber(raw?: string | null): string {
  if (!raw) return "";
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.length === 9) n = "51" + n;
  return n;
}

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map(
    (i) =>
      `• [${i.code}] ${i.name} x${i.qty} — S/ ${(i.price * i.qty).toFixed(2)}`,
  );
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  lines.push(`\n*Total: S/ ${total.toFixed(2)}*`);
  lines.push("\nHola, quisiera hacer este pedido");
  return lines.join("\n");
}
export function sendToWhatsApp(items: CartItem[], empresaWhatsapp?: string | null) {
  if (!items.length) return;
  const msg = buildWhatsAppMessage(items);
  const number =
    normalizeWhatsAppNumber(empresaWhatsapp) || normalizeWhatsAppNumber(WHATSAPP_NUMBER);
  const url = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
