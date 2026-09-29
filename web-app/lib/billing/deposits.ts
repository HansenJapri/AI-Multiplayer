import { readAccountEmails } from "@/lib/accounts/account-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { DepositCheckout, DepositProvider } from "./deposit-provider";
import { depositReference, manualDepositProvider } from "./manual-deposit-provider";
import { depositFor, type PaidPlan } from "./plans";

// Swap this for a hosted-checkout adapter once a payment provider is chosen.
export const defaultDepositProvider: DepositProvider = manualDepositProvider;

export type StartDepositResult =
  | { status: "started"; checkout: DepositCheckout }
  | { status: "invalid_seats" }
  | { status: "not_owner" };

export interface DepositSummary {
  id: string;
  reference: string;
  workspaceName: string;
  plan: PaidPlan;
  seats: number;
  amountCents: number;
  currency: string;
  status: "pending" | "paid";
  createdAt: string;
}

export interface PendingDeposit extends DepositSummary {
  ownerEmail: string;
}

// Carries only the Postgres error code: PostgREST details can quote row values.
export class DepositStoreError extends Error {
  override readonly name = "DepositStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Deposit storage failed (database error ${databaseErrorCode})`);
  }
}

const DEPOSIT_COLUMNS =
  "id, plan, seats, amount_cents, currency, status, created_at, workspace:workspaces(name)";

interface DepositRow {
  id: string;
  plan: string;
  seats: number;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  workspace: { name: string };
}

function depositSummary(row: DepositRow): DepositSummary {
  return {
    id: row.id,
    reference: depositReference(row.id),
    workspaceName: row.workspace.name,
    plan: row.plan as PaidPlan,
    seats: row.seats,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status as DepositSummary["status"],
    createdAt: row.created_at,
  };
}

// The amount always comes from the server's price list, never from the form.
export async function startDeposit(
  request: {
    workspaceId: string;
    userId: string;
    customerEmail: string;
    plan: PaidPlan;
    seats: number;
    origin: string;
  },
  provider: DepositProvider = defaultDepositProvider,
): Promise<StartDepositResult> {
  const amount = depositFor(request.plan, request.seats);
  if (amount === null) {
    return { status: "invalid_seats" };
  }

  const { data: depositId, error } = await createSupabaseAdminClient().rpc("start_deposit", {
    p_workspace_id: request.workspaceId,
    p_user_id: request.userId,
    p_plan: request.plan,
    p_seats: amount.seats,
    p_amount_cents: amount.amountCents,
    p_currency: amount.currency,
    p_provider: provider.name,
  });
  if (error) {
    throw new DepositStoreError(error.code);
  }
  // The generated type says string, but the function returns null when the user is not an owner.
  if ((depositId as string | null) === null) {
    return { status: "not_owner" };
  }

  const checkout = await provider.startCheckout({
    depositId,
    plan: request.plan,
    seats: amount.seats,
    amountCents: amount.amountCents,
    currency: amount.currency,
    customerEmail: request.customerEmail,
    returnUrl: new URL("/app/deposit", request.origin).toString(),
  });
  return { status: "started", checkout };
}

// Called once the provider confirms payment (for the manual provider: by an operator). Returns
// false when the deposit is unknown or already paid.
export async function completeDeposit(
  depositId: string,
  providerReference: string,
): Promise<boolean> {
  const { data: completed, error } = await createSupabaseAdminClient().rpc("complete_deposit", {
    p_deposit_id: depositId,
    p_provider_reference: providerReference,
  });
  if (error) {
    throw new DepositStoreError(error.code);
  }
  return completed;
}

// Row level security limits this to deposits of the user's own workspaces.
export async function listDepositsForUser(): Promise<DepositSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data: deposits, error } = await supabase
    .from("deposits")
    .select(DEPOSIT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) {
    throw new DepositStoreError(error.code);
  }
  return deposits.map(depositSummary);
}

// Operators only: reads every workspace's pending deposits with the service role.
export async function listPendingDeposits(): Promise<PendingDeposit[]> {
  const { data: deposits, error } = await createSupabaseAdminClient()
    .from("deposits")
    .select(`${DEPOSIT_COLUMNS}, started_by`)
    .eq("status", "pending")
    .order("created_at");
  if (error) {
    throw new DepositStoreError(error.code);
  }
  const ownerEmails = await readAccountEmails(deposits.map((deposit) => deposit.started_by));
  return deposits.map((deposit) => ({
    ...depositSummary(deposit),
    ownerEmail: ownerEmails.get(deposit.started_by) ?? "",
  }));
}
