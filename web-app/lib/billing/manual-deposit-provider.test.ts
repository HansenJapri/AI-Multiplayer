// @vitest-environment node
import { describe, expect, it } from "vitest";
import { depositReference, manualDepositProvider } from "./manual-deposit-provider";

describe("manualDepositProvider", () => {
  it("asks the customer to wait for payment instructions quoting a short reference", async () => {
    const checkout = await manualDepositProvider.startCheckout({
      depositId: "5f0c2b9e-1d2a-4c3b-9e8f-7a6b5c4d3e2f",
      plan: "team",
      seats: 2,
      amountCents: 6000,
      currency: "USD",
      customerEmail: "owner@agency.example",
      returnUrl: "https://ai-multiplayer.vercel.app/app/deposit",
    });

    expect(checkout).toEqual({
      kind: "instructions",
      reference: "DEP-5F0C2B9E",
      message:
        "We will email payment instructions for $60 to owner@agency.example within one business day. Quote DEP-5F0C2B9E with your payment. The deposit is fully refundable until your plan starts.",
    });
    expect(manualDepositProvider.name).toBe("manual");
  });
});

describe("depositReference", () => {
  it("is the first block of the deposit id in capitals", () => {
    expect(depositReference("abcdef12-0000-0000-0000-000000000000")).toBe("DEP-ABCDEF12");
  });
});
