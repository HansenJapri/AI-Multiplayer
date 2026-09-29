import { generateOpaqueToken, hashOpaqueToken } from "@/lib/security/opaque-token";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { RunStoreError } from "./runs";

export type CreateRunGuestInviteResult =
  { status: "created"; inviteUrl: string } | { status: "refused" };

export type AcceptRunGuestInviteResult =
  { status: "accepted"; runId: string } | { status: "invalid" };

export interface SharedRun {
  runId: string;
  claudeSessionId: string;
  workspaceName: string;
  sharedAt: string;
}

export async function createRunGuestInvite(invite: {
  runId: string;
  inviterId: string;
  email: string;
  origin: string;
}): Promise<CreateRunGuestInviteResult> {
  const token = generateOpaqueToken();
  const { data: inviteId, error } = await createSupabaseAdminClient().rpc(
    "create_run_guest_invite",
    {
      p_run_id: invite.runId,
      p_inviter_id: invite.inviterId,
      p_email: invite.email,
      p_token_hash: hashOpaqueToken(token),
    },
  );
  if (error) {
    throw new RunStoreError(error.code);
  }
  // The generated type says string, but the function returns null when the inviter is not on
  // the run's team.
  if ((inviteId as string | null) === null) {
    return { status: "refused" };
  }
  return { status: "created", inviteUrl: new URL(`/guest/${token}`, invite.origin).toString() };
}

export async function acceptRunGuestInvite(acceptance: {
  token: string;
  userId: string;
  email: string;
}): Promise<AcceptRunGuestInviteResult> {
  const { data: runId, error } = await createSupabaseAdminClient().rpc("accept_run_guest_invite", {
    p_token_hash: hashOpaqueToken(acceptance.token),
    p_user_id: acceptance.userId,
    p_user_email: acceptance.email,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  // Unknown, expired, used and wrong-email invites share one answer on purpose.
  const acceptedRunId = runId as string | null;
  return acceptedRunId === null
    ? { status: "invalid" }
    : { status: "accepted", runId: acceptedRunId };
}

// Read through the user's own session: row level security returns only their guest access.
export async function listRunsSharedWithGuest(userId: string): Promise<SharedRun[]> {
  const supabase = await createSupabaseServerClient();
  const { data: sharedRuns, error } = await supabase
    .from("run_guests")
    .select("created_at, run:runs(id, claude_session_id, workspace:workspaces(name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return sharedRuns.map((shared) => ({
    runId: shared.run.id,
    claudeSessionId: shared.run.claude_session_id,
    workspaceName: shared.run.workspace.name,
    sharedAt: shared.created_at,
  }));
}
