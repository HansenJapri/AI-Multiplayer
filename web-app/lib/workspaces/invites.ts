import { generateOpaqueToken, hashOpaqueToken } from "@/lib/security/opaque-token";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { WorkspaceStoreError } from "./workspaces";

export type CreateTeamInviteResult =
  { status: "created"; inviteUrl: string } | { status: "not_owner" };

export type AcceptTeamInviteResult =
  { status: "accepted"; workspaceId: string } | { status: "invalid" };

export async function createTeamInvite(invite: {
  workspaceId: string;
  inviterId: string;
  email: string;
  origin: string;
}): Promise<CreateTeamInviteResult> {
  const token = generateOpaqueToken();
  const { data: inviteId, error } = await createSupabaseAdminClient().rpc(
    "create_workspace_invite",
    {
      p_workspace_id: invite.workspaceId,
      p_inviter_id: invite.inviterId,
      p_email: invite.email,
      p_token_hash: hashOpaqueToken(token),
    },
  );
  if (error) {
    throw new WorkspaceStoreError(error.code);
  }
  // The generated type says string, but the function returns null when the inviter is not an owner.
  if ((inviteId as string | null) === null) {
    return { status: "not_owner" };
  }
  return { status: "created", inviteUrl: new URL(`/invite/${token}`, invite.origin).toString() };
}

export async function acceptTeamInvite(acceptance: {
  token: string;
  userId: string;
  email: string;
}): Promise<AcceptTeamInviteResult> {
  const { data: workspaceId, error } = await createSupabaseAdminClient().rpc(
    "accept_workspace_invite",
    {
      p_token_hash: hashOpaqueToken(acceptance.token),
      p_user_id: acceptance.userId,
      p_user_email: acceptance.email,
    },
  );
  if (error) {
    throw new WorkspaceStoreError(error.code);
  }
  // Unknown, expired, used and wrong-email invites share one answer on purpose.
  const acceptedWorkspaceId = workspaceId as string | null;
  return acceptedWorkspaceId === null
    ? { status: "invalid" }
    : { status: "accepted", workspaceId: acceptedWorkspaceId };
}
