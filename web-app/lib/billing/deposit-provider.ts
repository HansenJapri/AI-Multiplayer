import type { PaidPlan } from "./plans";

export interface DepositCheckoutRequest {
  depositId: string;
  plan: PaidPlan;
  seats: number;
  amountCents: number;
  currency: string;
  customerEmail: string;
  // Where a hosted checkout sends the customer back to.
  returnUrl: string;
}

// A hosted checkout sends the customer to the provider; an offline provider shows instructions.
export type DepositCheckout =
  { kind: "redirect"; url: string } | { kind: "instructions"; reference: string; message: string };

// The seam for the payment provider, which is not chosen yet. An adapter starts checkout for a
// recorded deposit; when the provider confirms payment, the app calls completeDeposit.
export interface DepositProvider {
  // Stored with each deposit. Lowercase letters, digits and underscores.
  readonly name: string;
  startCheckout(request: DepositCheckoutRequest): Promise<DepositCheckout>;
}
