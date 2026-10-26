import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Admin } from "./_authenticated/admin";
import { AuthForm } from "@/components/AuthForm";
import { Page } from "@/components/Shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/demo/admin")({
  head: () => ({ meta: [
    { title: "Owner demo — The Smash Grill" },
    { name: "description", content: "Sample orders and stock for the Smash Grill prototype." },
    { property: "og:title", content: "Owner demo — The Smash Grill" },
    { property: "og:description", content: "Sample owner dashboard for The Smash Grill." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: OwnerDemo,
});
function OwnerDemo() {
  const { demoRole } = useAuth();
  const navigate = useNavigate();
  if (demoRole !== "owner") return <Page><AuthForm title="Owner sign in" subtitle="Sample orders, products and stock." demoRole="owner" onDone={() => navigate({ to: "/demo/admin" })} /></Page>;
  return <Admin />;
}