import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  name: z.string().trim().max(80),
});

export function AuthForm({ title, subtitle, allowSignup, onDone }: { title: string; subtitle: string; allowSignup?: boolean; onDone: () => void }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) onDone(); }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) return setMsg({ type: "err", text: r.error.issues[0]?.message ?? "Check your details" });
    setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: r.data.email, password: r.data.password });
      if (error) setMsg({ type: "err", text: error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: r.data.email, password: r.data.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: r.data.name } },
      });
      if (error) setMsg({ type: "err", text: error.message });
      else if (!data.session) setMsg({ type: "ok", text: "Check your email to confirm your account, then sign in." });
    }
    setBusy(false);
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + window.location.pathname });
    if (res.error) setMsg({ type: "err", text: res.error.message });
  };

  const field = "w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <div className="mx-4 md:mx-auto md:max-w-md mt-8 md:mt-16 rounded-2xl border border-border bg-card p-6">
      <h1 className="font-script text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      <button onClick={google} className="mt-5 w-full rounded-full border border-border bg-background py-3 text-sm font-semibold hover:border-primary">Continue with Google</button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex-1 h-px bg-border" />or<span className="flex-1 h-px bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && <input aria-label="Full name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />}
        <input aria-label="Email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
        <input aria-label="Password" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
        {msg && <p className={`text-sm ${msg.type === "err" ? "text-destructive" : "text-accent"}`}>{msg.text}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary text-primary-foreground py-3 font-bold disabled:opacity-60">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      {allowSignup && (
        <p className="text-sm text-center mt-4 text-muted-foreground">
          {mode === "in" ? "New here? " : "Already have an account? "}
          <button className="text-primary font-semibold" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>{mode === "in" ? "Create an account" : "Sign in"}</button>
        </p>
      )}
    </div>
  );
}
