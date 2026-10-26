import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner sign in — The Smash Grill" },
      { name: "description", content: "Owner access to manage products, stock and orders for The Smash Grill." },
      { property: "og:title", content: "Owner sign in — The Smash Grill" },
      { property: "og:description", content: "Owner dashboard sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerLogin,
});

function OwnerLogin() {
  const { user, isAdmin, loading, refreshRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { supabase.rpc("owner_exists").then(({ data }) => setOwnerExists(!!data)); }, []);
  useEffect(() => { if (isAdmin) navigate({ to: "/admin" }); }, [isAdmin, navigate]);

  const claim = async () => {
    const { data, error } = await supabase.rpc("claim_owner");
    if (error || !data) { setErr("An owner account already exists."); setOwnerExists(true); return; }
    await refreshRole();
  };

  if (loading) return <Page><p className="p-10 text-center text-muted-foreground">Loading…</p></Page>;
  if (!user) return <Page><AuthForm title="Owner sign in" subtitle="Manage products, stock and incoming orders." allowSignup={ownerExists === false} onDone={() => {}} /></Page>;

  return (
    <Page>
      <div className="mx-4 md:mx-auto md:max-w-md mt-10 md:mt-16 rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="font-script text-3xl">Owner access</h1>
        {ownerExists === false ? (
          <>
            <p className="text-sm text-muted-foreground mt-2">No owner is set up yet. Make <b>{user.email}</b> the owner account?</p>
            <button onClick={claim} className="mt-5 w-full rounded-full bg-primary text-primary-foreground py-3 font-bold">Make me the owner</button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">{user.email} isn't the owner account.</p>
        )}
        {err && <p className="text-destructive text-sm mt-3">{err}</p>}
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <button onClick={signOut} className="text-primary">Sign out</button>
          <Link to="/" className="text-muted-foreground">Back to store</Link>
        </div>
      </div>
    </Page>
  );
}
