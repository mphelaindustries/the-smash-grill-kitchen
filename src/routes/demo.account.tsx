import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Account } from "./_authenticated/account";
import { AuthForm } from "@/components/AuthForm";
import { Page } from "@/components/Shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/demo/account")({
  head: () => ({ meta: [
    { title: "Customer demo — The Smash Grill" },
    { name: "description", content: "Sample pickup details and orders for the Smash Grill prototype." },
    { property: "og:title", content: "Customer demo — The Smash Grill" },
    { property: "og:description", content: "Sample customer account for The Smash Grill." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: CustomerDemo,
});
function CustomerDemo() {
  const { demoRole } = useAuth();
  const navigate = useNavigate();
  if (demoRole !== "customer") return <Page><AuthForm title="Customer sign in" subtitle="Sample pickup details and orders." onDone={() => navigate({ to: "/demo/account" })} /></Page>;
  return <Account />;
}