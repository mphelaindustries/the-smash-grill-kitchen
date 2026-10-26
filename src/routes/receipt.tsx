import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { Page } from "@/components/Shell";
import { useCart } from "@/lib/cart";
import { formatRand, SHOP, whatsappUrl } from "@/lib/order";

export const Route = createFileRoute("/receipt")({
  head: () => ({
    meta: [
      { title: "Your Receipt — The Smash Grill" },
      { name: "description", content: "Digital receipt for your Smash Grill pickup order." },
      { property: "og:title", content: "Your Receipt — The Smash Grill" },
      { property: "og:description", content: "Digital receipt for your pickup order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { lastOrder: o } = useCart();
  if (!o) return (
    <Page>
      <div className="m-4 mt-10 text-center rounded-2xl border border-border bg-card py-10">
        <p className="text-muted-foreground">No orders yet.</p>
        <Link to="/menu" className="inline-block mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">Start an order</Link>
      </div>
    </Page>
  );
  return (
    <Page>
      <div className="px-4 mt-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
        <h1 className="font-script text-3xl mt-2">Order sent!</h1>
        <p className="text-sm text-muted-foreground">Make sure you pressed send in WhatsApp. We'll confirm shortly.</p>
      </div>
      <div className="receipt mx-4 mt-6 rounded-2xl bg-foreground text-background p-5 font-mono text-sm">
        <div className="text-center">
          <img src={logo} alt="" className="h-16 w-16 mx-auto" />
          <p className="font-bold mt-1">{SHOP.name.toUpperCase()}</p>
          <p className="text-xs">{SHOP.phoneDisplay} · PICKUP ORDER</p>
        </div>
        <div className="border-t border-dashed border-background/40 my-3" />
        <p>Order: <b>{o.ref}</b></p>
        <p>Date: {new Date(o.createdAt).toLocaleString("en-ZA")}</p>
        <p>Name: {o.customer.name}</p>
        <p>Phone: {o.customer.phone}</p>
        <p>Pickup: {o.customer.pickupTime}</p>
        {o.customer.notes && <p>Notes: {o.customer.notes}</p>}
        <div className="border-t border-dashed border-background/40 my-3" />
        {o.lines.map((l, i) => (
          <div key={i} className="flex justify-between gap-2"><span>{l.qty} x {l.name}</span><span>{formatRand(l.price * l.qty)}</span></div>
        ))}
        <div className="border-t border-dashed border-background/40 my-3" />
        <div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>{formatRand(o.total)}</span></div>
        <p className="text-center text-xs mt-3">Pay on collection · Thank you! 🔥</p>
      </div>
      <div className="px-4 mt-4 grid grid-cols-2 gap-3 print:hidden">
        <a href={whatsappUrl(o)} target="_blank" rel="noreferrer" className="rounded-full border border-primary text-primary py-3 text-center font-semibold text-sm">Resend WhatsApp</a>
        <button onClick={() => window.print()} className="rounded-full bg-primary text-primary-foreground py-3 font-semibold text-sm">Save / Print</button>
      </div>
    </Page>
  );
}
