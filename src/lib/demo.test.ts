import { describe, expect, it } from "vitest";
import { demoLogin, demoUser, getDemoOrders, setDemoOrderStatus } from "./demo";

describe("Prototype demo access", () => {
  it("accepts the public customer demo credentials", () => {
    expect(demoLogin("customer", "customer@smash.demo", "SmashDemo123")).toBe(true);
    expect(demoLogin("customer", "customer@smash.demo", "wrong")).toBe(false);
  });
  it("accepts owner credentials only for the owner demo", () => {
    expect(demoLogin("owner", "owner@smash.demo", "OwnerDemo123")).toBe(true);
    expect(demoLogin("owner", "customer@smash.demo", "SmashDemo123")).toBe(false);
  });
  it("creates a sample identity, not a backend account", () => {
    expect(demoUser("owner").id).toBe("demo-owner");
    expect(demoUser("owner").app_metadata).toEqual({});
  });
  it("updates sample orders locally", async () => {
    setDemoOrderStatus("demo-order-1", "ready");
    expect((await getDemoOrders()).find((o) => o.id === "demo-order-1")?.status).toBe("ready");
  });
});