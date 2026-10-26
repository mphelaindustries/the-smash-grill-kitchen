import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DEMO_CREDENTIALS, demoLogin, type DemoRole } from "@/lib/demo";

export function AuthForm({ title, subtitle, demoRole = "customer", onDone }: { title: string; subtitle: string; demoRole?: DemoRole; onDone: () => void }) {
  const { demoRole: activeRole, enterDemo } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);
  const credentials = DEMO_CREDENTIALS[demoRole];
  useEffect(() => { if (activeRole === demoRole) onDone(); }, [activeRole, demoRole]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoLogin(demoRole, form.email, form.password)) return setMsg({ type: "err", text: "Use the demo email and password shown above." });
    setMsg(null);
    enterDemo(demoRole);
  };

  const field = "w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <div className="mx-4 md:mx-auto md:max-w-md mt-8 md:mt-16 rounded-2xl border border-border bg-card p-6">
      <h1 className="font-script text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      <div className="my-5 border-y border-border py-4 text-sm space-y-2">
        <p className="font-semibold text-accent">{demoRole === "owner" ? "Owner" : "Customer"} demo</p>
        <p>Email: <span className="font-mono break-all">{credentials.email}</span></p>
        <p>Password: <span className="font-mono">{credentials.password}</span></p>
        <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...credentials })}>Fill demo details</Button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input aria-label="Email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
        <input aria-label="Password" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
        {msg && <p className={`text-sm ${msg.type === "err" ? "text-destructive" : "text-accent"}`}>{msg.text}</p>}
        <Button type="submit" className="w-full rounded-full h-12 font-bold">Sign in to demo</Button>
      </form>
      <p className="text-xs text-muted-foreground mt-4">Prototype · sample data only · no real account required</p>
    </div>
  );
}
