import { describe, it, expect } from "vitest";
import { cartTotal, buildOrder, whatsappUrl, recommendations } from "./order";
import { MENU } from "./menu";

describe("order", () => {
  it("totals menu prices in rand", () => {
    expect(cartTotal([{ id: "beef-smash-burger", qty: 2 }, { id: "cold-drink-large", qty: 1 }], MENU)).toBe(110);
  });
  it("sends orders to the kitchen WhatsApp number", () => {
    const o = buildOrder([{ id: "half-chicken-chips", qty: 1 }], { name: "A", phone: "1", pickupTime: "ASAP", notes: "" }, MENU);
    expect(whatsappUrl(o).startsWith("https://wa.me/27663343526?text=")).toBe(true);
    expect(o.total).toBe(90);
  });
  it("never recommends sold-out items", () => {
    const products = MENU.map((m) => (m.id === "cold-drink-small" ? { ...m, inStock: false } : m));
    expect(recommendations([], products).some((r) => r.id === "cold-drink-small")).toBe(false);
  });
});
