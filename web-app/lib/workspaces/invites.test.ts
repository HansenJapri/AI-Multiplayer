// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashOpaqueToken } from "@/lib/security/opaque-token";
import { acceptTeamInvite, createTeamInvite } from "./invites";
import { WorkspaceStoreError } from "./workspaces";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));

const ORIGIN = "https://ai-multiplayer.vercel.app";

describe("createTeamInvite", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("stores only the token hash and returns a one-time invite link carrying the token", async () => {
    rpcMock.mockResolvedValueOnce({ data: "invite-1", error: null });

    const result = await createTeamInvite({
      workspaceId: "workspace-1",
      inviterId: "owner-1",
      email: "friend@example.com",
      origin: ORIGIN,
    });

    if (result.status !== "created") {
      throw new Error(`expected created, got ${result.status}`);
    }
    const token = new URL(result.inviteUrl).pathname.replace("/invite/", "");
    expect(result.inviteUrl).toBe(`${ORIGIN}/invite/${token}`);
    expect(rpcMock).toHaveBeenCalledWith("create_workspace_invite", {
      p_workspace_id: "workspace-1",
      p_inviter_id: "owner-1",
      p_email: "friend@example.com",
      p_token_hash: hashOpaqueToken(token),
    });
  });

  it("reports that only owners can invite when the database refuses", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    const result = await createTeamInvite({
      workspaceId: "workspace-1",
      inviterId: "driver-1",
      email: "friend@example.com",
      origin: ORIGIN,
    });

    expect(result).toEqual({ status: "not_owner" });
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23505", message: "dup" } });

    await expect(
      createTeamInvite({ workspaceId: "w", inviterId: "o", email: "a@b.co", origin: ORIGIN }),
    ).rejects.toThrow(WorkspaceStoreError);
  });
});

describe("acceptTeamInvite", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("accepts with the token hash and the signed-in user's email", async () => {
    rpcMock.mockResolvedValueOnce({ data: "workspace-1", error: null });

    const result = await acceptTeamInvite({
      token: "invite-token",
      userId: "user-2",
      email: "friend@example.com",
    });

    expect(result).toEqual({ status: "accepted", workspaceId: "workspace-1" });
    expect(rpcMock).toHaveBeenCalledWith("accept_workspace_invite", {
      p_token_hash: hashOpaqueToken("invite-token"),
      p_user_id: "user-2",
      p_user_email: "friend@example.com",
    });
  });

  it("reports an invalid invite without saying why", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await acceptTeamInvite({ token: "t", userId: "u", email: "a@b.co" })).toEqual({
      status: "invalid",
    });
  });
});
