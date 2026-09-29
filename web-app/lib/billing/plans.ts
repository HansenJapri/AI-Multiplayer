// Prices are hypotheses until deposits come in; they live here and nowhere else.
export type PaidPlan = "team" | "agency";

export interface Plan {
  name: string;
  monthlyPriceCents: number;
  // Team is priced per driver (someone who may steer, hold or take over); Agency per workspace.
  perSeat: boolean;
  summary: string;
  features: string[];
}

export const DEPOSIT_CURRENCY = "USD";
const MAX_SEATS = 500;

export const PLANS: Record<PaidPlan, Plan> = {
  team: {
    name: "Team",
    monthlyPriceCents: 3000,
    perSeat: true,
    summary: "per driver per month",
    features: [
      "Watch, steer, hold and hand over every run",
      "Viewers, commenters and client guests are free",
      "90-day run history",
    ],
  },
  agency: {
    name: "Agency",
    monthlyPriceCents: 19900,
    perSeat: false,
    summary: "per workspace per month",
    features: [
      "Everything in Team, for all your drivers",
      "Client guest links, one run per client",
      "Internal and client-visible comments",
    ],
  },
};

export function parsePaidPlan(value: string | null): PaidPlan | null {
  return value === "team" || value === "agency" ? value : null;
}

export interface DepositAmount {
  seats: number;
  amountCents: number;
  currency: string;
}

// The deposit is the first month of the chosen plan. Returns null for an invalid seat count.
export function depositFor(plan: PaidPlan, seats: number): DepositAmount | null {
  const { monthlyPriceCents, perSeat } = PLANS[plan];
  if (!perSeat) {
    return { seats: 1, amountCents: monthlyPriceCents, currency: DEPOSIT_CURRENCY };
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) {
    return null;
  }
  return { seats, amountCents: monthlyPriceCents * seats, currency: DEPOSIT_CURRENCY };
}

export function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}
