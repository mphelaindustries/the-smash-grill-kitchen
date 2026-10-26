import { describe, it, expect } from "vitest";
import { cartTotal, buildOrder, whatsappUrl } from "./order";

describe("order", () => {
  it("totals menu prices in rand", () => {
    expect(cartTotal([{ id: "beef-smash-burger", qty: 2 }, { id: "cold-drink-large", qty: 1 }])).toBe(110);
  });
  it("sends orders to the kitchen WhatsApp number", () => {
    const o = buildOrder([{ id: "half-chicken-chips", qty: 1 }], { name: "A", phone: "1", pickupTime: "ASAP", notes: "" });
    expect(whatsappUrl(o).startsWith("https://wa.me/27663343526?text=")).toBe(true);
    expect(o.total).toBe(90);
  });
});
