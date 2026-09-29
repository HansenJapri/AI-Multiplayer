import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { listDepositsForUser } from "@/lib/billing/deposits";
import { formatAmount, parsePaidPlan, PLANS } from "@/lib/billing/plans";
import { listWorkspacesForUser } from "@/lib/workspaces/workspaces";
import { DepositForm } from "./deposit-form";

interface DepositPageProps {
  searchParams: Promise<{ plan?: string | string[] }>;
}

export default async function DepositPage({ searchParams }: DepositPageProps) {
  const { plan: requestedPlan } = await searchParams;
  const plan = parsePaidPlan(typeof requestedPlan === "string" ? requestedPlan : null) ?? "team";
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath(`/app/deposit?plan=${plan}`));
  }
  const [workspaces, deposits] = await Promise.all([
    listWorkspacesForUser(user.id),
    listDepositsForUser(),
  ]);
  const ownedWorkspaces = workspaces.filter((workspace) => workspace.role === "owner");

  return (
    <main>
      <h1>Reserve your plan</h1>
      <p>
        Place a deposit worth the first month of your plan. It is fully refundable until your plan
        starts, and is credited to your first invoice. <Link href="/pricing">See pricing</Link>.
      </p>
      {ownedWorkspaces.length === 0 ? (
        <p className="muted">
          Only a workspace owner can place a deposit. <Link href="/app">Create a workspace</Link>{" "}
          first.
        </p>
      ) : (
        <DepositForm workspaces={ownedWorkspaces} initialPlan={plan} />
      )}
      {deposits.length === 0 ? null : (
        <>
          <h2>Your deposits</h2>
          <ul aria-label="Your deposits" className="list">
            {deposits.map((deposit) => (
              <li key={deposit.id} className="list-item">
                <span>
                  <code>{deposit.reference}</code> · {deposit.workspaceName} ·{" "}
                  {PLANS[deposit.plan].name}
                  {PLANS[deposit.plan].perSeat ? ` · ${String(deposit.seats)} drivers` : ""} ·{" "}
                  {formatAmount(deposit.amountCents, deposit.currency)}
                </span>
                <span className="badge">{deposit.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
