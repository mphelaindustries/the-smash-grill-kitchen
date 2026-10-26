import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight, Flame } from "lucide-react";
import { useState } from "react";
import { Page, ItemCard, SectionTitle } from "@/components/Shell";
import { CATEGORIES, IMAGES, type MenuItem } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { useProducts } from "@/lib/products";
import { formatRand, SHOP } from "@/lib/order";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Smash Grill — Order Smash Burgers, Shawarma & Chicken for Pickup" },
      { name: "description", content: "Order smash burgers, shawarma, grilled chicken and loaded fries online for pickup at The Smash Grill Kitchen." },
      { property: "og:title", content: "The Smash Grill — Order for Pickup" },
      { property: "og:description", content: "Smash burgers, shawarma, chicken & loaded fries. Order online, pay on pickup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const { add } = useCart();
  const { products, byId } = useProducts();
  const results = q.trim() ? products.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())) : [];
  const pick = (ids: string[]) => ids.map(byId).filter((m): m is MenuItem => !!m);
  const signature = pick(["beef-smash-burger", "shawarma-chicken-chips", "half-chicken-chips", "meat-fries-large"]);
  const bundles = pick(["full-chicken-large-chips", "full-chicken-chips-rolls"]);

  return (
    <Page>
      <section className="relative h-[420px] md:h-[560px] overflow-hidden md:rounded-3xl md:mt-4">
        <img src={IMAGES.platter} alt="Smash Grill chefs plating burgers, shawarma and fries" className="absolute inset-0 h-full w-full object-cover object-top md:object-center" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="relative p-5 pt-10 md:p-14 md:pt-24 max-w-xs md:max-w-3xl">
          <h1 className="font-script text-5xl md:text-8xl leading-[0.95] -rotate-3 md:whitespace-nowrap">Smashed Hot,<br /><span className="text-primary text-6xl md:text-9xl">Grilled Bold</span></h1>
          <p className="mt-4 md:mt-8 text-sm md:text-lg text-foreground/90">Fresh off the flat-top. Order now, collect at the kitchen.</p>
          <Link to="/menu" className="hidden md:inline-flex mt-8 items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 font-bold shadow-[var(--shadow-glow)]">Order now <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="px-4 -mt-8 relative md:max-w-2xl md:mx-auto">
        <label className="flex items-center gap-3 rounded-full border border-primary/40 bg-card px-4 py-3 md:py-4">
          <Search className="h-5 w-5 text-accent" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search burgers, shawarma, chips..." className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground" />
        </label>
        {results.length > 0 && (
          <div className="mt-2 rounded-xl border border-border bg-card divide-y divide-border">
            {results.map((r) => (
              <button key={r.id} disabled={!r.inStock} onClick={() => add(r.id)} className="w-full flex justify-between px-4 py-2.5 text-sm hover:bg-secondary disabled:opacity-50">
                <span>{r.name}</span><span className="text-primary font-semibold">{r.inStock ? `${formatRand(r.price)} +` : "Sold out"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto px-4 mt-5 md:mt-10 no-scrollbar">
        {CATEGORIES.map((c, i) => (
          <Link key={c.id} to="/menu" hash={c.id} className={`shrink-0 w-24 h-24 md:w-auto md:h-28 rounded-2xl border grid place-items-center text-center text-xs md:text-sm font-medium hover:border-primary transition ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
            <span><span className="block text-3xl md:text-4xl mb-1">{c.emoji}</span>{c.label}</span>
          </Link>
        ))}
      </div>

      <SectionTitle title="Signature Smash" action={<Link to="/menu" className="text-primary text-sm">View all ›</Link>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 px-4">
        {signature.map((m) => <ItemCard key={m.id} item={m} />)}
      </div>

      <SectionTitle title="Family Feasts" sub="Perfect for sharing!" />
      <div className="grid md:grid-cols-2 gap-3 md:gap-5 px-4">
        {bundles.map((b) => (
          <div key={b.id} className="relative rounded-2xl overflow-hidden border border-border bg-card h-36 md:h-48 flex">
            <div className="p-4 md:p-6 z-10 flex flex-col justify-between w-1/2">
              <span className="self-start rounded bg-accent text-accent-foreground text-[10px] font-bold uppercase px-1.5 py-0.5">{b.tag} feast</span>
              <p className="text-sm md:text-lg font-semibold">{b.name}</p>
              <p className="text-primary font-bold text-lg md:text-2xl">{b.inStock ? formatRand(b.price) : "Sold out"}</p>
            </div>
            <img src={b.image} alt={b.name} loading="lazy" className="absolute right-0 top-0 h-full w-3/5 object-cover [mask-image:linear-gradient(to_right,transparent,black_35%)]" />
            <button disabled={!b.inStock} onClick={() => add(b.id)} aria-label={`Add ${b.name}`} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-foreground text-background grid place-items-center disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 md:gap-5 px-4 mt-4 md:mt-5">
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-4 md:p-6 h-44 md:h-56">
          <h3 className="font-script text-2xl md:text-3xl">Chef Special</h3>
          <p className="text-xs text-primary">Made with 🔥 on the grill</p>
          <p className="mt-3 font-semibold text-sm md:text-base">Beef Shawarma + Chips</p>
          <p className="text-xs text-muted-foreground max-w-[50%]">Charred wrap, peppers & sauce</p>
          <p className="text-primary font-bold mt-1">{formatRand(byId("shawarma-beef-chips")?.price ?? 75)}</p>
          <img src={IMAGES.wrap} alt="Beef shawarma wrap" loading="lazy" className="absolute right-0 bottom-0 h-full w-1/2 object-cover [mask-image:linear-gradient(to_right,transparent,black_40%)]" />
          <button onClick={() => add("shawarma-beef-chips")} className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold" aria-label="Add Beef Shawarma">+</button>
        </div>
        <div className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground p-4 md:p-6 h-44 md:h-56">
          <h3 className="font-display text-3xl md:text-5xl leading-none uppercase">Smash<br />Combo Deal</h3>
          <p className="text-sm mt-2 max-w-[55%]">Burger, chips & a cold drink for {formatRand(byId("burger-chips-drink")?.price ?? 75)}</p>
          <button onClick={() => add("burger-chips-drink")} className="mt-3 rounded-full bg-accent text-accent-foreground px-4 py-1.5 text-sm font-semibold">Order Now</button>
          <img src={IMAGES.grill} alt="Smash burger on the grill" loading="lazy" className="absolute -right-4 bottom-0 h-full w-1/2 object-cover rounded-l-full" />
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-border bg-card p-4 flex items-center gap-4 md:hidden">
        <Flame className="h-8 w-8 text-primary shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Pickup only · {SHOP.name}</p>
          <p className="text-muted-foreground">Call or WhatsApp {SHOP.phoneDisplay} · @smash_grill_cafe</p>
        </div>
      </div>
    </Page>
  );
}
