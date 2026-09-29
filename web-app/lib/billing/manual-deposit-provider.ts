import type { DepositProvider } from "./deposit-provider";
import { formatAmount } from "./plans";

export function depositReference(depositId: string): string {
  return `DEP-${depositId.slice(0, 8).toUpperCase()}`;
}

// No payment provider yet: an operator emails payment instructions, and marks the deposit paid
// on the operator page once the money arrives.
export const manualDepositProvider: DepositProvider = {
  name: "manual",
  startCheckout({ depositId, amountCents, currency, customerEmail }) {
    const reference = depositReference(depositId);
    return Promise.resolve({
      kind: "instructions",
      reference,
      message:
        `We will email payment instructions for ${formatAmount(amountCents, currency)} to ` +
        `${customerEmail} within one business day. Quote ${reference} with your payment. ` +
        "The deposit is fully refundable until your plan starts.",
    });
  },
};
