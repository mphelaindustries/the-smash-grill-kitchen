import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatRand } from "@/lib/order";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — The Smash Grill" },
      { name: "description", content: "Your saved pickup details and Smash Grill order history." },
      { property: "og:title", content: "My account — The Smash Grill" },
      { property: "og:description", content: "Your Smash Grill order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

type Item = { name: string; qty: number; price: number };

function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [saved, setSaved] = useState(false);

  const profile = useQuery({
    queryKey: ["profile", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("full_name, phone").eq("id", user!.id).maybeSingle()).data,
  });
  const orders = useQuery({
    queryKey: ["my-orders", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => { if (profile.data) setForm({ full_name: profile.data.full_name ?? "", phone: profile.data.phone ?? "" }); }, [profile.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("profiles").update({ full_name: form.full_name.trim().slice(0, 80), phone: form.phone.trim().slice(0, 20) }).eq("id", user!.id);
    setSaved(true); qc.invalidateQueries({ queryKey: ["profile"] });
  };
  const field = "w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <Page>
      <div className="px-4 mt-6 md:mt-10 flex justify-between items-end">
        <h1 className="font-script text-4xl md:text-5xl">My account</h1>
        <button onClick={async () => { await signOut(); navigate({ to: "/", replace: true }); }} className="text-sm text-primary">Sign out</button>
      </div>
      <div className="md:grid md:grid-cols-[360px_1fr] md:gap-8 md:items-start px-4 mt-4">
        <form onSubmit={save} className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Pickup details</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <input aria-label="Full name" placeholder="Full name" value={form.full_name} onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setSaved(false); }} className={field} />
          <input aria-label="Phone" placeholder="Phone number" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setSaved(false); }} className={field} />
          <button className="w-full rounded-full bg-primary text-primary-foreground py-2.5 font-bold">{saved ? "Saved ✓" : "Save"}</button>
        </form>
        <div className="mt-6 md:mt-0">
          <h2 className="font-script text-2xl mb-3">Order history</h2>
          {orders.data?.length === 0 && <p className="text-muted-foreground text-sm">No orders yet.</p>}
          <div className="space-y-3">
            {orders.data?.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{o.ref}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">{o.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-ZA")} · {o.pickup_time}</p>
                <ul className="mt-2 text-sm">
                  {(o.items as Item[]).map((i, k) => <li key={k}>{i.qty} x {i.name}</li>)}
                </ul>
                <p className="mt-2 text-primary font-bold">{formatRand(Number(o.total))}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
