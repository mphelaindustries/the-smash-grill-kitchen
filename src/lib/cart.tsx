import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine, Order } from "./order";

type Ctx = {
  lines: CartLine[];
  count: number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  lastOrder: Order | null;
  saveOrder: (o: Order) => void;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLines(JSON.parse(localStorage.getItem("tsg-cart") || "[]"));
      setLastOrder(JSON.parse(localStorage.getItem("tsg-last-order") || "null"));
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("tsg-cart", JSON.stringify(lines)); }, [lines, ready]);

  const value: Ctx = {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    add: (id) => setLines((ls) => ls.some((l) => l.id === id) ? ls.map((l) => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...ls, { id, qty: 1 }]),
    setQty: (id, qty) => setLines((ls) => qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => l.id === id ? { ...l, qty } : l)),
    clear: () => setLines([]),
    lastOrder,
    saveOrder: (o) => { setLastOrder(o); localStorage.setItem("tsg-last-order", JSON.stringify(o)); },
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
