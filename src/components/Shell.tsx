import { Link } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag, Receipt, User, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatRand, WHATSAPP_CHAT } from "@/lib/order";
import type { MenuItem } from "@/lib/menu";
import type { ReactNode } from "react";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.69L.55 23.63l6.05-1.59a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.34-8.06z" />
    </svg>
  );
}

function AccountLink({ className }: { className: string }) {
  const { user, isAdmin } = useAuth();
  if (isAdmin) return <Link to="/admin" className={className}><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></Link>;
  if (user) return <Link to="/account" className={className}><User className="h-5 w-5" /><span>Account</span></Link>;
  return <Link to="/auth" className={className}><User className="h-5 w-5" /><span>Sign in</span></Link>;
}

export function TopBar() {
  const { count } = useCart();
  const desk = "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground [&.active]:text-primary";
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 md:px-6 py-3">
        <div className="leading-tight md:hidden">
          <p className="text-xs text-muted-foreground">Pickup from</p>
          <p className="text-primary font-semibold text-sm">Smash Grill Kitchen</p>
        </div>
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="The Smash Grill logo" className="h-12 w-12" width={48} height={48} />
          <span className="hidden md:block font-display text-2xl uppercase tracking-wide">The <span className="text-primary">Smash</span> Grill</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          <Link to="/" className={desk} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/menu" className={desk}>Menu</Link>
          <Link to="/receipt" className={desk}>Receipt</Link>
          <AccountLink className={desk} />
          <Link to="/cart" className="relative flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]">
            <ShoppingBag className="h-4 w-4" /> Cart {count > 0 && <span className="rounded-full bg-background text-foreground px-2 text-xs">{count}</span>}
          </Link>
        </nav>
        <Link to="/cart" className="relative p-2 md:hidden" aria-label="Cart">
          <ShoppingBag className="h-6 w-6" />
          {count > 0 && <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs grid place-items-center font-bold">{count}</span>}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { count } = useCart();
  const item = "flex flex-col items-center gap-1 text-xs text-muted-foreground [&.active]:text-primary";
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex justify-center md:hidden print:hidden">
      <div className="w-full mx-2 mb-2 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-2 grid grid-cols-5 items-end">
        <Link to="/" className={item} activeOptions={{ exact: true }}><Home className="h-5 w-5" />Home</Link>
        <Link to="/menu" className={item}><UtensilsCrossed className="h-5 w-5" />Menu</Link>
        <Link to="/cart" className="flex flex-col items-center -mt-8">
          <span className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)] relative">
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && <span className="absolute top-1 right-1 h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-xs grid place-items-center font-bold">{count}</span>}
          </span>
          <span className="text-xs mt-1 text-primary font-semibold">Order</span>
        </Link>
        <AccountLink className={item} />
        <a href={WHATSAPP_CHAT} target="_blank" rel="noreferrer" className={item}><WhatsAppIcon className="h-5 w-5" />WhatsApp</a>
      </div>
    </nav>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-32 md:pb-16">
      <TopBar />
      <div className="mx-auto max-w-6xl md:px-2">{children}</div>
      <footer className="hidden md:flex mx-auto max-w-6xl px-6 mt-16 pt-6 border-t border-border justify-between text-xs text-muted-foreground">
        <span>© The Smash Grill · @smash_grill_cafe</span>
        <Link to="/owner" className="hover:text-primary">Owner sign in</Link>
      </footer>
    </div>
  );
}

export function ItemCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border bg-card aspect-[4/5] group ${item.inStock ? "" : "opacity-60"}`}>
      <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-[image:var(--gradient-fade)]" />
      {!item.inStock ? (
        <span className="absolute top-2 left-2 rounded-md bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-1.5 py-0.5">Sold out</span>
      ) : item.tag && <span className="absolute top-2 left-2 rounded-md bg-accent text-accent-foreground text-[10px] font-bold uppercase px-1.5 py-0.5">{item.tag}</span>}
      <div className="absolute bottom-0 inset-x-0 p-3 pr-12">
        <p className="text-sm md:text-base font-semibold leading-tight">{item.name}</p>
        <p className="text-primary font-bold">{formatRand(item.price)}</p>
      </div>
      <button disabled={!item.inStock} onClick={() => add(item.id)} aria-label={`Add ${item.name}`} className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg grid place-items-center active:scale-90 transition disabled:bg-muted disabled:text-muted-foreground">+</button>
    </div>
  );
}

export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-4 mt-8 md:mt-14 mb-3 md:mb-5">
      <h2 className="font-script text-2xl md:text-4xl">{title} {sub && <span className="text-accent text-sm md:text-base">{sub}</span>}</h2>
      {action}
    </div>
  );
}
