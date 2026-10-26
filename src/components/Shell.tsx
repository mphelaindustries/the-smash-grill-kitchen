import { Link } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag, Receipt, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCart } from "@/lib/cart";
import { formatRand, SHOP } from "@/lib/order";
import type { MenuItem } from "@/lib/menu";
import type { ReactNode } from "react";

export function TopBar() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/85 backdrop-blur border-b border-border">
      <div className="leading-tight">
        <p className="text-xs text-muted-foreground">Pickup from</p>
        <p className="text-primary font-semibold text-sm">Smash Grill Kitchen</p>
      </div>
      <Link to="/"><img src={logo} alt="The Smash Grill logo" className="h-12 w-12" width={48} height={48} /></Link>
      <Link to="/cart" className="relative p-2" aria-label="Cart">
        <ShoppingBag className="h-6 w-6" />
        {count > 0 && <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs grid place-items-center font-bold">{count}</span>}
      </Link>
    </header>
  );
}

export function BottomNav() {
  const { count } = useCart();
  const item = "flex flex-col items-center gap-1 text-xs text-muted-foreground [&.active]:text-primary";
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex justify-center">
      <div className="w-full max-w-3xl mx-2 mb-2 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-2 grid grid-cols-5 items-end">
        <Link to="/" className={item} activeOptions={{ exact: true }}><Home className="h-5 w-5" />Home</Link>
        <Link to="/menu" className={item}><UtensilsCrossed className="h-5 w-5" />Menu</Link>
        <Link to="/cart" className="flex flex-col items-center -mt-8">
          <span className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)] relative">
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && <span className="absolute top-1 right-1 h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-xs grid place-items-center font-bold">{count}</span>}
          </span>
          <span className="text-xs mt-1 text-primary font-semibold">Order</span>
        </Link>
        <Link to="/receipt" className={item}><Receipt className="h-5 w-5" />Receipt</Link>
        <a href={`tel:${SHOP.phoneDisplay.replace(/\s/g, "")}`} className={item}><Phone className="h-5 w-5" />Call</a>
      </div>
    </nav>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl min-h-screen pb-32"><TopBar />{children}</div>;
}

export function ItemCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-card aspect-[4/5] group">
      <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-[image:var(--gradient-fade)]" />
      {item.tag && <span className="absolute top-2 left-2 rounded-md bg-accent text-accent-foreground text-[10px] font-bold uppercase px-1.5 py-0.5">{item.tag}</span>}
      <div className="absolute bottom-0 inset-x-0 p-3 pr-12">
        <p className="text-sm font-semibold leading-tight">{item.name}</p>
        <p className="text-primary font-bold">{formatRand(item.price)}</p>
      </div>
      <button onClick={() => add(item.id)} aria-label={`Add ${item.name}`} className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg grid place-items-center active:scale-90 transition">+</button>
    </div>
  );
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-4 mt-8 mb-3">
      <h2 className="font-script text-2xl">{title} {sub && <span className="text-accent text-sm">{sub}</span>}</h2>
      {action}
    </div>
  );
}
