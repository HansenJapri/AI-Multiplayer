import type { Metadata } from "next";
import Link from "next/link";
import { DEPOSIT_CURRENCY, formatAmount, PLANS, type PaidPlan } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Pricing · AI Multiplayer",
};

const PAID_PLANS: PaidPlan[] = ["team", "agency"];

export default function PricingPage() {
  return (
    <main className="pricing">
      <p>
        <Link href="/">AI Multiplayer</Link>
      </p>
      <h1>Pricing</h1>
      <p className="muted">
        Every teammate runs Claude Code on their own machine and subscription. We never store your
        model keys, so you only pay for the shared layer.
      </p>
      <div className="plans">
        <section aria-label="Free" className="card plan">
          <h2>Free</h2>
          <p className="plan-price">{formatAmount(0, DEPOSIT_CURRENCY)}</p>
          <ul>
            <li>One driver</li>
            <li>Teammates watch and comment for free</li>
          </ul>
          <Link className="button button-quiet" href="/login">
            Start free
          </Link>
        </section>
        {PAID_PLANS.map((paidPlan) => {
          const plan = PLANS[paidPlan];
          return (
            <section key={paidPlan} aria-label={plan.name} className="card plan">
              <h2>{plan.name}</h2>
              <p className="plan-price">
                {formatAmount(plan.monthlyPriceCents, DEPOSIT_CURRENCY)} {plan.summary}
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link className="button" href={`/app/deposit?plan=${paidPlan}`}>
                Reserve with a refundable deposit
              </Link>
            </section>
          );
        })}
      </div>
      <p className="muted">
        The deposit equals your first month. It is fully refundable until your plan starts and is
        credited to your first invoice.
      </p>
    </main>
  );
}
