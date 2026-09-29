import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listPendingDeposits } from "@/lib/billing/deposits";
import { isOperatorEmail } from "@/lib/billing/operators";
import { formatAmount, PLANS } from "@/lib/billing/plans";
import { markDepositPaidAction } from "./actions";

// Hidden from everyone but the operators listed in OPERATOR_EMAILS.
export default async function OperatorDepositsPage() {
  const user = await getCurrentUser();
  if (user === null || !isOperatorEmail(user.email)) {
    notFound();
  }
  const deposits = await listPendingDeposits();

  return (
    <main>
      <h1>Pending deposits</h1>
      <p className="muted">
        Email each owner payment instructions quoting the reference. When the money arrives, mark
        the deposit paid with the payment reference.
      </p>
      {deposits.length === 0 ? (
        <p>No pending deposits.</p>
      ) : (
        <ul aria-label="Pending deposits" className="list">
          {deposits.map((deposit) => (
            <li key={deposit.id} className="card">
              <p>
                <code>{deposit.reference}</code> · {deposit.workspaceName} ·{" "}
                {PLANS[deposit.plan].name}
                {PLANS[deposit.plan].perSeat ? ` · ${String(deposit.seats)} drivers` : ""} ·{" "}
                <strong>{formatAmount(deposit.amountCents, deposit.currency)}</strong>
              </p>
              <p className="muted">
                {deposit.ownerEmail} · {new Date(deposit.createdAt).toUTCString()}
              </p>
              <form action={markDepositPaidAction} className="form">
                <input type="hidden" name="depositId" value={deposit.id} readOnly />
                <label htmlFor={`reference-${deposit.id}`}>Payment reference</label>
                <input id={`reference-${deposit.id}`} name="reference" maxLength={200} />
                <button className="button" type="submit">
                  Mark {deposit.reference} paid
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
