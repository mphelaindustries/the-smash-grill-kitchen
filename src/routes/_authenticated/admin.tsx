import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Page } from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, productsKey } from "@/lib/products";
import { CATEGORIES, IMAGE_KEYS, imageFor, type MenuItem } from "@/lib/menu";
import { formatRand, ORDER_STATUSES } from "@/lib/order";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — The Smash Grill" },
      { name: "description", content: "Manage orders, products, prices and stock for The Smash Grill." },
      { property: "og:title", content: "Owner dashboard — The Smash Grill" },
      { property: "og:description", content: "Smash Grill owner dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Item = { id: string; name: string; qty: number; price: number };
const TABS = ["Overview", "Orders", "Products"] as const;

function Admin() {
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  if (loading) return <Page><p className="p-10 text-center text-muted-foreground">Loading…</p></Page>;
  if (!isAdmin) return (
    <Page>
      <div className="m-4 md:mx-auto md:max-w-md mt-16 rounded-2xl border border-border bg-card p-6 text-center">
        <p>{user?.email} doesn't have owner access.</p>
        <Link to="/owner" className="text-primary text-sm mt-3 inline-block">Go to owner sign in</Link>
      </div>
    </Page>
  );
  return (
    <Page>
      <div className="px-4 mt-6 md:mt-10 flex flex-wrap gap-4 justify-between items-end">
        <h1 className="font-display text-4xl md:text-6xl uppercase">Owner <span className="text-primary">Dashboard</span></h1>
        <div className="flex rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="px-4 mt-6">
        {tab === "Overview" && <Overview />}
        {tab === "Orders" && <Orders />}
        {tab === "Products" && <Products />}
      </div>
    </Page>
  );
}

function useOrders() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
  return { ...q, refresh: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }) };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}

function Overview() {
  const { data = [] } = useOrders();
  const { data: products = [] } = useQuery({ queryKey: productsKey, queryFn: fetchProducts });
  const s = useMemo(() => {
    const valid = data.filter((o) => o.status !== "cancelled");
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const week = Date.now() - 7 * 864e5;
    const sum = (arr: typeof valid) => arr.reduce((t, o) => t + Number(o.total), 0);
    const today = valid.filter((o) => new Date(o.created_at) >= start);
    const counts = new Map<string, number>();
    valid.forEach((o) => (o.items as Item[]).forEach((i) => counts.set(i.name, (counts.get(i.name) ?? 0) + i.qty)));
    return {
      today: sum(today), todayCount: today.length,
      week: sum(valid.filter((o) => +new Date(o.created_at) >= week)),
      all: sum(valid), count: valid.length,
      open: data.filter((o) => ["new", "preparing", "ready"].includes(o.status)).length,
      top: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [data]);
  const low = products.filter((p) => !p.inStock || (p.stock !== null && p.stock <= 5));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Sales today" value={formatRand(s.today)} />
        <Stat label="Orders today" value={String(s.todayCount)} />
        <Stat label="Last 7 days" value={formatRand(s.week)} />
        <Stat label="Open orders" value={String(s.open)} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Best sellers</h3>
          {s.top.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet.</p> : (
            <ol className="space-y-2 text-sm">{s.top.map(([n, c]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="text-primary font-bold">{c} sold</span></li>)}</ol>
          )}
          <p className="text-xs text-muted-foreground mt-4">All time: {formatRand(s.all)} from {s.count} orders</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Stock alerts</h3>
          {low.length === 0 ? <p className="text-sm text-muted-foreground">Everything is in stock.</p> : (
            <ul className="space-y-2 text-sm">{low.map((p) => <li key={p.id} className="flex justify-between"><span>{p.name}</span><span className={p.inStock ? "text-accent" : "text-destructive"}>{p.inStock ? `${p.stock} left` : "Sold out"}</span></li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const { data = [], refresh, isLoading } = useOrders();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const list = filter === "open" ? data.filter((o) => ["new", "preparing", "ready"].includes(o.status)) : data;
  const setStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    refresh();
  };
  return (
    <div>
      <div className="flex gap-2 mb-4 text-sm">
        {(["open", "all"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full border ${filter === f ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{f === "open" ? "Open" : "All orders"}</button>)}
        <button onClick={refresh} className="ml-auto text-primary">Refresh</button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <p className="text-muted-foreground text-sm">No orders here.</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between"><span className="font-bold">{o.ref}</span><span className="text-primary font-bold">{formatRand(Number(o.total))}</span></div>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-ZA")}</p>
              <p className="text-sm mt-2">{o.customer_name} · <a href={`tel:${o.phone}`} className="text-primary">{o.phone}</a></p>
              <p className="text-xs text-muted-foreground">Pickup: {o.pickup_time}</p>
              <ul className="mt-2 text-sm">{(o.items as Item[]).map((i, k) => <li key={k}>{i.qty} x {i.name}</li>)}</ul>
              {o.notes && <p className="text-xs mt-2 italic">“{o.notes}”</p>}
              <select aria-label="Order status" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="mt-3 w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm capitalize">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Products() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: productsKey, queryFn: fetchProducts });
  const refresh = () => qc.invalidateQueries({ queryKey: productsKey });
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{products.length} products · leave stock empty for unlimited</p>
        <button onClick={() => setAdding(!adding)} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-bold">{adding ? "Close" : "+ Add product"}</button>
      </div>
      {adding && <ProductRow isNew onSaved={() => { setAdding(false); refresh(); }} />}
      <div className="space-y-2">
        {products.map((p) => <ProductRow key={p.id} product={p} onSaved={refresh} />)}
      </div>
    </div>
  );
}

function ProductRow({ product, isNew, onSaved }: { product?: MenuItem; isNew?: boolean; onSaved: () => void }) {
  const init = () => ({
    name: product?.name ?? "", price: String(product?.price ?? ""), category: product?.category ?? "burgers",
    image: product?.imageKey ?? "grill", tag: product?.tag ?? "", stock: product?.stock == null ? "" : String(product.stock),
    in_stock: product?.inStock ?? true,
  });
  const [f, setF] = useState(init);
  const [state, setState] = useState<"" | "saving" | "saved" | string>("");
  useEffect(() => { setF(init()); }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    const price = Number(f.price);
    const stock = f.stock.trim() === "" ? null : Math.max(0, Math.floor(Number(f.stock)));
    if (!f.name.trim() || !(price >= 0) || Number.isNaN(price) || (stock !== null && Number.isNaN(stock))) return setState("Check name, price and stock");
    setState("saving");
    const row = { name: f.name.trim().slice(0, 80), price, category: f.category, image: f.image, tag: f.tag.trim() || null, stock, in_stock: stock === 0 ? false : f.in_stock };
    const { error } = isNew
      ? await supabase.from("products").insert({ ...row, id: f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36), sort: 999 })
      : await supabase.from("products").update(row).eq("id", product!.id);
    setState(error ? error.message : "saved");
    if (!error) onSaved();
  };
  const remove = async () => {
    if (!product || !confirm(`Delete ${product.name}?`)) return;
    await supabase.from("products").delete().eq("id", product.id);
    onSaved();
  };
  const inp = "rounded-lg bg-secondary border border-border px-2.5 py-2 text-sm outline-none focus:border-primary min-w-0";
  return (
    <div className={`rounded-2xl border bg-card p-3 grid grid-cols-2 md:grid-cols-[48px_2fr_90px_140px_110px_100px_80px_auto] gap-2 items-center ${isNew ? "border-primary mb-4" : "border-border"}`}>
      <img src={imageFor(f.image)} alt="" className="h-12 w-12 rounded-lg object-cover hidden md:block" />
      <input aria-label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Product name" className={`${inp} col-span-2 md:col-span-1`} />
      <input aria-label="Price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="Price R" inputMode="decimal" className={inp} />
      <select aria-label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inp}>
        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <select aria-label="Photo" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} className={inp}>
        {IMAGE_KEYS.map((k) => <option key={k} value={k}>Photo: {k}</option>)}
      </select>
      <input aria-label="Tag" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })} placeholder="Tag" className={inp} />
      <input aria-label="Stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} placeholder="Stock ∞" inputMode="numeric" className={inp} />
      <div className="flex items-center gap-2 col-span-2 md:col-span-1 justify-end">
        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <input type="checkbox" checked={f.in_stock} onChange={(e) => setF({ ...f, in_stock: e.target.checked })} className="accent-[var(--primary)]" /> In stock
        </label>
        <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">{state === "saving" ? "…" : state === "saved" ? "✓" : "Save"}</button>
        {!isNew && <button onClick={remove} className="text-xs text-destructive">Delete</button>}
      </div>
      {state && !["saving", "saved"].includes(state) && <p className="text-destructive text-xs col-span-full">{state}</p>}
    </div>
  );
}
