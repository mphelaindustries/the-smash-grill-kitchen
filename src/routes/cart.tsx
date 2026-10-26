import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Page, SectionTitle } from "@/components/Shell";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useProducts } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { buildOrder, cartTotal, formatRand, recommendations, SHOP, whatsappUrl } from "@/lib/order";
import { placeDemoOrder } from "@/lib/demo";

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
  const { user, demoRole } = useAuth();
  const { products, byId, query } = useProducts();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", pickupTime: "ASAP (20–30 min)", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const total = cartTotal(lines, products);
  const recs = recommendations(lines, products);
  const soldOut = lines.filter((l) => byId(l.id)?.inStock === false);

  useEffect(() => {
    if (demoRole) { setForm((f) => ({ ...f, name: f.name || "Demo Customer", phone: f.phone || "0000000000" })); return; }
    if (!user) return;
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm((f) => ({ ...f, name: f.name || data.full_name || "", phone: f.phone || data.phone || "" }));
    });
  }, [user, demoRole]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({}); setSubmitError(""); setSubmitting(true);
    const order = buildOrder(lines, r.data, products);
    if (demoRole) {
      const sample = { ...order, ref: "DEMO-" + order.ref };
      placeDemoOrder(sample); saveOrder(sample); clear(); setSubmitting(false);
      navigate({ to: "/receipt" }); return;
    }
    // Open the tab synchronously so pop-up blockers allow it; fill the URL after saving.
    const win = window.open("", "_blank");
    const { error } = await supabase.from("orders").insert({
      ref: order.ref, user_id: user?.id ?? null, customer_name: r.data.name, phone: r.data.phone,
      pickup_time: r.data.pickupTime, notes: r.data.notes || null, items: lines,
    });
    setSubmitting(false);
    if (error) {
      win?.close();
      setSubmitError(error.message.includes("sold out") ? error.message : "Couldn't place your order. Please try again.");
      void query.refetch();
      return;
    }
    if (user) await supabase.from("profiles").update({ full_name: r.data.name, phone: r.data.phone }).eq("id", user.id);
    if (win) win.location.href = whatsappUrl(order); else window.location.href = whatsappUrl(order);
    saveOrder(order);
    clear();
    navigate({ to: "/receipt" });
  };

  const field = "w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <Page>
      <h1 className="font-script text-4xl md:text-5xl px-4 mt-6 md:mt-10">Your Order</h1>
      <div className="md:grid md:grid-cols-[1fr_400px] md:gap-8 md:items-start">
        <div>
          {lines.length === 0 ? (
            <div className="mt-6 text-center rounded-2xl border border-border bg-card mx-4 py-10">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link to="/menu" className="inline-block mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">Browse the menu</Link>
            </div>
          ) : (
            <div className="px-4 mt-4 space-y-3">
              {lines.map((l) => {
                const m = byId(l.id);
                if (!m) return null;
                return (
                  <div key={l.id} className="flex gap-3 items-center rounded-2xl border border-border bg-card p-2">
                    <img src={m.image} alt={m.name} className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-semibold">{m.name}</p>
                      <p className="text-primary text-sm font-bold">{m.inStock ? formatRand(m.price * l.qty) : <span className="text-destructive">Sold out — please remove</span>}</p>
                    </div>
                    <div className="flex items-center gap-2 pr-2">
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

          {recs.length > 0 && <>
            <SectionTitle title="Goes great with" sub="Recommended" />
            <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto px-4 no-scrollbar">
              {recs.map((r) => (
                <div key={r.id} className="shrink-0 w-36 md:w-auto rounded-2xl border border-border bg-card overflow-hidden">
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
          </>}
        </div>

        {lines.length > 0 && (
          <form onSubmit={submit} className="px-4 mt-8 md:mt-4 space-y-3 md:sticky md:top-24 md:rounded-2xl md:border md:border-border md:bg-card md:p-6">
            <h2 className="font-script text-2xl">Pickup details</h2>
            {!user && <p className="text-xs text-muted-foreground"><Link to="/auth" className="text-primary underline">Sign in</Link> to save your details and see your order history — or just order as a guest.</p>}
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
            {submitError && <p className="text-destructive text-sm">{submitError}</p>}
            <button type="submit" disabled={submitting || soldOut.length > 0} className="w-full rounded-full bg-primary text-primary-foreground py-3.5 font-bold text-base shadow-[var(--shadow-glow)] disabled:opacity-60">
              {submitting ? "Placing order…" : `${demoRole ? "Place demo order" : "Send order on WhatsApp"} · ${formatRand(total)}`}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
