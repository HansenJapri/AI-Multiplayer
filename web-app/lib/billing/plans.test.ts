// @vitest-environment node
import { describe, expect, it } from "vitest";
import { depositFor, parsePaidPlan, PLANS } from "./plans";

describe("PLANS", () => {
  it("prices Team per driver and Agency per workspace, both monthly in USD", () => {
    expect(PLANS.team).toMatchObject({ monthlyPriceCents: 3000, perSeat: true });
    expect(PLANS.agency).toMatchObject({ monthlyPriceCents: 19900, perSeat: false });
  });
});

describe("parsePaidPlan", () => {
  it("accepts only the plans that take a deposit", () => {
    expect(parsePaidPlan("team")).toBe("team");
    expect(parsePaidPlan("agency")).toBe("agency");
    expect(parsePaidPlan("free")).toBeNull();
    expect(parsePaidPlan(null)).toBeNull();
  });
});

describe("depositFor", () => {
  it("holds the first month of Team for each driver", () => {
    expect(depositFor("team", 3)).toEqual({ seats: 3, amountCents: 9000, currency: "USD" });
  });

  it("holds the first month of Agency for the whole workspace, whatever the seat count", () => {
    expect(depositFor("agency", 12)).toEqual({ seats: 1, amountCents: 19900, currency: "USD" });
  });

  it("refuses a seat count outside 1 to 500", () => {
    expect(depositFor("team", 0)).toBeNull();
    expect(depositFor("team", 501)).toBeNull();
    expect(depositFor("team", 1.5)).toBeNull();
  });
});
