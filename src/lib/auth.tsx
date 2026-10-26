import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { demoUser, readDemoRole, type DemoRole } from "./demo";

type AuthState = { user: User | null; isAdmin: boolean; demoRole: DemoRole | null; enterDemo: (role: DemoRole) => void; loading: boolean; refreshRole: () => Promise<void>; signOut: () => Promise<void> };
const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoRole, setDemoRole] = useState<DemoRole | null>(null);

  const loadRole = async (u: User | null) => {
    if (!u) { setIsAdmin(false); return; }
    const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
    setIsAdmin(!!data);
  };

  useEffect(() => {
    setDemoRole(readDemoRole());
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => { void loadRole(u).finally(() => setLoading(false)); }, 0);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") qc.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      void loadRole(data.session?.user ?? null).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  const value: AuthState = {
    user: demoRole ? demoUser(demoRole) : user, isAdmin: demoRole ? false : isAdmin, demoRole, loading,
    enterDemo: (role) => { sessionStorage.setItem("tsg-demo-session", role); qc.clear(); setDemoRole(role); },
    refreshRole: () => loadRole(user),
    signOut: async () => { await qc.cancelQueries(); qc.clear(); if (demoRole) { sessionStorage.removeItem("tsg-demo-session"); setDemoRole(null); return; } await supabase.auth.signOut(); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
