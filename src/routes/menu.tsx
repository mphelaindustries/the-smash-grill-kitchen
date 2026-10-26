import { createFileRoute } from "@tanstack/react-router";
import { Page, ItemCard } from "@/components/Shell";
import { CATEGORIES, MENU } from "@/lib/menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Full Menu — The Smash Grill" },
      { name: "description", content: "Burgers, chicken, shawarma & tacos and hot smash grabs with prices in rand." },
      { property: "og:title", content: "Full Menu — The Smash Grill" },
      { property: "og:description", content: "See every burger, chicken meal, shawarma and side at The Smash Grill." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <Page>
      <h1 className="font-display text-6xl px-4 mt-6 leading-none uppercase"><span className="text-primary">Food</span><br />Menu</h1>
      {CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} className="scroll-mt-20">
          <h2 className="font-display text-3xl text-primary uppercase px-4 mt-8 mb-3">{c.label}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
            {MENU.filter((m) => m.category === c.id).map((m) => <ItemCard key={m.id} item={m} />)}
          </div>
        </section>
      ))}
    </Page>
  );
}
