"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import {
  DEPOSIT_CURRENCY,
  depositFor,
  formatAmount,
  PLANS,
  type PaidPlan,
} from "@/lib/billing/plans";
import type { WorkspaceSummary } from "@/lib/workspaces/workspaces";
import { startDepositAction } from "./actions";
import type { DepositFormState } from "./deposit-state";

const INITIAL_STATE: DepositFormState = { status: "idle" };
const PAID_PLANS: PaidPlan[] = ["team", "agency"];

export function DepositForm({
  workspaces,
  initialPlan,
}: {
  workspaces: WorkspaceSummary[];
  initialPlan: PaidPlan;
}) {
  const [state, formAction] = useActionState(startDepositAction, INITIAL_STATE);
  const [plan, setPlan] = useState(initialPlan);
  const [seats, setSeats] = useState(1);
  // Shown for guidance only; the server prices the deposit again from the same list.
  const amount = depositFor(plan, seats);

  if (state.status === "instructions") {
    return (
      <div role="status" className="card">
        <p className="message-success">Deposit {state.reference} reserved.</p>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="form">
      <label htmlFor="deposit-workspace">Workspace</label>
      <select id="deposit-workspace" name="workspaceId" required>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
      <fieldset className="plan-choice">
        <legend>Plan</legend>
        {PAID_PLANS.map((paidPlan) => (
          <label key={paidPlan} className="checkbox">
            <input
              type="radio"
              name="plan"
              value={paidPlan}
              checked={plan === paidPlan}
              onChange={() => {
                setPlan(paidPlan);
              }}
            />
            {PLANS[paidPlan].name} (
            {formatAmount(PLANS[paidPlan].monthlyPriceCents, DEPOSIT_CURRENCY)}{" "}
            {PLANS[paidPlan].summary})
          </label>
        ))}
      </fieldset>
      {PLANS[plan].perSeat ? (
        <>
          <label htmlFor="deposit-seats">Drivers</label>
          <input
            id="deposit-seats"
            name="seats"
            type="number"
            min={1}
            max={500}
            value={seats}
            onChange={(event) => {
              setSeats(Number(event.target.value));
            }}
            required
          />
        </>
      ) : null}
      <p className="muted">
        Deposit:{" "}
        <strong>{amount === null ? "—" : formatAmount(amount.amountCents, amount.currency)}</strong>
        , fully refundable.
      </p>
      <SubmitButton label="Place refundable deposit" pendingLabel="Reserving…" />
      {state.status === "invalid_seats" ? (
        <p role="alert" className="message-error">
          Choose between 1 and 500 drivers.
        </p>
      ) : null}
      {state.status === "invalid_plan" ? (
        <p role="alert" className="message-error">
          Choose Team or Agency.
        </p>
      ) : null}
      {state.status === "not_owner" ? (
        <p role="alert" className="message-error">
          Only the workspace owner can place a deposit.
        </p>
      ) : null}
    </form>
  );
}
