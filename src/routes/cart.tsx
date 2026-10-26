import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Page, SectionTitle } from "@/components/Shell";
import { useCart } from "@/lib/cart";
import { byId } from "@/lib/menu";
import { buildOrder, cartTotal, formatRand, recommendations, SHOP, whatsappUrl } from "@/lib/order";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — The Smash Grill" },
      { name: "description", content: "Review your order, add extras and send it to The Smash Grill Kitchen on WhatsApp for pickup." },
      { property: "og:title", content: "Your Cart — The Smash Grill" },
      { property: "og:description", content: "Checkout your pickup order via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d\s()-]{9,16}$/, "Enter a valid phone number"),
  pickupTime: z.string().trim().min(1, "Choose a pickup time").max(40),
  notes: z.string().trim().max(300),
});

function CartPage() {
  const { lines, add, setQty, clear, saveOrder } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", pickupTime: "ASAP (20–30 min)", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const total = cartTotal(lines);
  const recs = recommendations(lines);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    const order = buildOrder(lines, r.data);
    saveOrder(order);
    window.open(whatsappUrl(order), "_blank");
    clear();
    navigate({ to: "/receipt" });
  };

  const field = "w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <Page>
      <h1 className="font-script text-4xl px-4 mt-6">Your Order</h1>
      {lines.length === 0 ? (
        <div className="px-4 mt-6 text-center rounded-2xl border border-border bg-card mx-4 py-10">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/menu" className="inline-block mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">Browse the menu</Link>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {lines.map((l) => {
            const m = byId(l.id)!;
            return (
              <div key={l.id} className="flex gap-3 items-center rounded-2xl border border-border bg-card p-2">
                <img src={m.image} alt={m.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-primary text-sm font-bold">{formatRand(m.price * l.qty)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease" onClick={() => setQty(l.id, l.qty - 1)} className="h-8 w-8 rounded-full bg-secondary grid place-items-center">{l.qty === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}</button>
                  <span className="w-5 text-center font-semibold">{l.qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(l.id, l.qty + 1)} className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between text-lg font-bold pt-2"><span>Total</span><span className="text-primary">{formatRand(total)}</span></div>
          <p className="text-xs text-muted-foreground">Pickup at {SHOP.name} · pay on collection</p>
        </div>
      )}

      <SectionTitle title="Goes great with" sub="Recommended" />
      <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar">
        {recs.map((r) => (
          <div key={r.id} className="shrink-0 w-36 rounded-2xl border border-border bg-card overflow-hidden">
            <img src={r.image} alt={r.name} loading="lazy" className="h-24 w-full object-cover" />
            <div className="p-2">
              <p className="text-xs font-semibold leading-tight h-8">{r.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-primary text-sm font-bold">{formatRand(r.price)}</span>
                <button onClick={() => add(r.id)} aria-label={`Add ${r.name}`} className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lines.length > 0 && (
        <form onSubmit={submit} className="px-4 mt-8 space-y-3">
          <h2 className="font-script text-2xl">Pickup details</h2>
          {([["name", "Full name"], ["phone", "Phone number"]] as const).map(([k, label]) => (
            <div key={k}>
              <input aria-label={label} placeholder={label} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={field} inputMode={k === "phone" ? "tel" : undefined} />
              {errors[k] && <p className="text-destructive text-xs mt-1">{errors[k]}</p>}
            </div>
          ))}
          <select aria-label="Pickup time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className={field}>
            {["ASAP (20–30 min)", "In 45 minutes", "In 1 hour", "In 2 hours"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <textarea aria-label="Notes" placeholder="Notes (e.g. no onions, extra sauce)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={field} rows={3} />
          <button type="submit" className="w-full rounded-full bg-primary text-primary-foreground py-3.5 font-bold text-base shadow-[var(--shadow-glow)]">
            Send order on WhatsApp · {formatRand(total)}
          </button>
        </form>
      )}
    </Page>
  );
}
