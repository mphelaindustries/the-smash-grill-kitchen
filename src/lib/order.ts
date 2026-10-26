import type { MenuItem } from "./menu";

export const SHOP = { name: "The Smash Grill Kitchen", phoneDisplay: "066 334 3526", whatsapp: "27663343526" };
export const WHATSAPP_CHAT = `https://wa.me/${SHOP.whatsapp}`;

export type CartLine = { id: string; qty: number };
export type Customer = { name: string; phone: string; pickupTime: string; notes: string };
export type Order = { ref: string; createdAt: string; lines: { name: string; price: number; qty: number }[]; total: number; customer: Customer };

export const formatRand = (n: number) => `R${n.toFixed(2)}`;
const find = (products: MenuItem[], id: string) => products.find((p) => p.id === id);

export function cartTotal(lines: CartLine[], products: MenuItem[]) {
  return lines.reduce((s, l) => s + (find(products, l.id)?.price ?? 0) * l.qty, 0);
}

/** Suggest in-stock sides/drinks not in cart; drinks first if no drink in cart. */
export function recommendations(lines: CartLine[], products: MenuItem[], limit = 4): MenuItem[] {
  const inCart = new Set(lines.map((l) => l.id));
  const hasDrink = lines.some((l) => l.id.includes("drink"));
  const pool = ["cold-drink-small", "cold-drink-large", "meat-fries-large", "large-chips", "hot-dog-chicken", "beef-smash-burger"];
  const ordered = hasDrink ? pool.filter((p) => !p.startsWith("cold-drink")) : pool;
  return ordered
    .filter((id) => !inCart.has(id))
    .map((id) => find(products, id))
    .filter((m): m is MenuItem => !!m && m.inStock)
    .slice(0, limit);
}

export function buildOrder(lines: CartLine[], customer: Customer, products: MenuItem[], now = new Date()): Order {
  const items = lines.flatMap((l) => { const m = find(products, l.id); return m ? [{ name: m.name, price: m.price, qty: l.qty }] : []; });
  const ref = "TSG-" + now.getTime().toString(36).toUpperCase().slice(-6);
  return { ref, createdAt: now.toISOString(), lines: items, total: cartTotal(lines, products), customer };
}

export function whatsappMessage(o: Order) {
  const rows = o.lines.map((l) => `• ${l.qty} x ${l.name} — ${formatRand(l.price * l.qty)}`).join("\n");
  return [
    `🔥 *NEW PICKUP ORDER — THE SMASH GRILL*`,
    `Order: *${o.ref}*`,
    ``,
    rows,
    ``,
    `*TOTAL: ${formatRand(o.total)}*`,
    ``,
    `👤 Name: ${o.customer.name}`,
    `📞 Phone: ${o.customer.phone}`,
    `⏰ Pickup: ${o.customer.pickupTime}`,
    o.customer.notes ? `📝 Notes: ${o.customer.notes}` : "",
    `📍 Pickup at ${SHOP.name}`,
  ].filter((x) => x !== "").join("\n");
}

export const whatsappUrl = (o: Order) => `${WHATSAPP_CHAT}?text=${encodeURIComponent(whatsappMessage(o))}`;

export const ORDER_STATUSES = ["new", "preparing", "ready", "collected", "cancelled"] as const;
