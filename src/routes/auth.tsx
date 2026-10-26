import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Page } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — The Smash Grill" },
      { name: "description", content: "Sign in to save your pickup details and see your Smash Grill order history." },
      { property: "og:title", content: "Sign in — The Smash Grill" },
      { property: "og:description", content: "Customer sign in for The Smash Grill." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerAuth,
});

function CustomerAuth() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const safe = redirect === "/cart" ? "/cart" : "/demo/account";
  return (
    <Page>
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to save your details and track your orders."
        onDone={() => navigate({ to: safe })}
      />
    </Page>
  );
}
