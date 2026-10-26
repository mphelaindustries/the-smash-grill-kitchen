import type { User } from "@supabase/supabase-js";
import { MENU, imageFor, type MenuItem } from "./menu";
import type { Order } from "./order";

export type DemoRole = "customer" | "owner";
export const DEMO_CREDENTIALS = {
  customer: { email: "customer@smash.demo", password: "SmashDemo123" },
  owner: { email: "owner@smash.demo", password: "OwnerDemo123" },
} as const;
export function demoLogin(role: DemoRole, email: string, password: string) {
  const credentials = DEMO_CREDENTIALS[role];
  return email.trim().toLowerCase() === credentials.email && password === credentials.password;
}
export function readDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const role = sessionStorage.getItem("tsg-demo-session");
  return role === "customer" || role === "owner" ? role : null;
}
export function demoUser(role: DemoRole): User {
  return { id: `demo-${role}`, email: DEMO_CREDENTIALS[role].email, app_metadata: {}, user_metadata: {}, aud: "demo", created_at: "2026-10-26T00:00:00Z" };
}
export type DemoOrder = {
  id: string; ref: string; user_id: string; customer_name: string; phone: string;
  pickup_time: string; notes: string | null; created_at: string; status: string; total: number;
  items: { id?: string; name: string; qty: number; price: number }[];
};
let products: MenuItem[] = MENU.map((p, i) => ({ ...p, stock: i === 0 ? 4 : 25 }));
let orders: DemoOrder[] = [{
  id: "demo-order-1", ref: "DEMO-001", user_id: "demo-customer", customer_name: "Demo Customer",
  phone: "0000000000", pickup_time: "In 45 minutes", notes: "Sample order",
  created_at: new Date().toISOString(), status: "new", total: 45,
  items: [{ id: "beef-smash-burger", name: "Beef Smash Burger", qty: 1, price: 45 }],
}];
export const getDemoProducts = async () => products.map((p) => ({ ...p }));
export const getDemoOrders = async () => orders.map((o) => ({ ...o }));
export function setDemoOrderStatus(id: string, status: string) {
  orders = orders.map((o) => o.id === id ? { ...o, status } : o);
}
export function saveDemoProduct(product: MenuItem) {
  const row = { ...product, image: imageFor(product.imageKey) };
  products = products.some((p) => p.id === row.id) ? products.map((p) => p.id === row.id ? row : p) : [...products, row];
}
export function deleteDemoProduct(id: string) { products = products.filter((p) => p.id !== id); }
export function placeDemoOrder(order: Order) {
  orders = [{ id: order.ref, ref: order.ref, user_id: "demo-customer", customer_name: order.customer.name,
    phone: order.customer.phone, pickup_time: order.customer.pickupTime, notes: order.customer.notes || null,
    created_at: order.createdAt, status: "new", total: order.total, items: order.lines }, ...orders];
}