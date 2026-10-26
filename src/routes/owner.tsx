import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Page } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";

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
  const navigate = useNavigate();
  return <Page><AuthForm title="Owner sign in" subtitle="Manage sample orders, products and stock." demoRole="owner" onDone={() => navigate({ to: "/demo/admin" })} /></Page>;
}
