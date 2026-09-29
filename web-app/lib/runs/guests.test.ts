// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashOpaqueToken } from "@/lib/security/opaque-token";
import { acceptRunGuestInvite, createRunGuestInvite, listRunsSharedWithGuest } from "./guests";
import { RunStoreError } from "./runs";

const { rpcMock, fromMock } = vi.hoisted(() => ({ rpcMock: vi.fn(), fromMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ from: fromMock }),
}));

const ORIGIN = "https://ai-multiplayer.vercel.app";

describe("createRunGuestInvite", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("stores only the token hash and returns a one-time guest link carrying the token", async () => {
    rpcMock.mockResolvedValueOnce({ data: "invite-1", error: null });

    const result = await createRunGuestInvite({
      runId: "run-1",
      inviterId: "driver-1",
      email: "buyer@client.example",
      origin: ORIGIN,
    });

    if (result.status !== "created") {
      throw new Error(`expected created, got ${result.status}`);
    }
    const token = new URL(result.inviteUrl).pathname.replace("/guest/", "");
    expect(result.inviteUrl).toBe(`${ORIGIN}/guest/${token}`);
    expect(rpcMock).toHaveBeenCalledWith("create_run_guest_invite", {
      p_run_id: "run-1",
      p_inviter_id: "driver-1",
      p_email: "buyer@client.example",
      p_token_hash: hashOpaqueToken(token),
    });
  });

  it("reports a refusal when the inviter is not on the run's team", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    const result = await createRunGuestInvite({
      runId: "run-1",
      inviterId: "client-1",
      email: "friend@client.example",
      origin: ORIGIN,
    });

    expect(result).toEqual({ status: "refused" });
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "bad email" } });

    await expect(
      createRunGuestInvite({ runId: "r", inviterId: "u", email: "nope", origin: ORIGIN }),
    ).rejects.toThrow(RunStoreError);
  });
});

describe("acceptRunGuestInvite", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("accepts with the token hash and the signed-in user's email", async () => {
    rpcMock.mockResolvedValueOnce({ data: "run-1", error: null });

    const result = await acceptRunGuestInvite({
      token: "guest-token",
      userId: "client-1",
      email: "buyer@client.example",
    });

    expect(result).toEqual({ status: "accepted", runId: "run-1" });
    expect(rpcMock).toHaveBeenCalledWith("accept_run_guest_invite", {
      p_token_hash: hashOpaqueToken("guest-token"),
      p_user_id: "client-1",
      p_user_email: "buyer@client.example",
    });
  });

  it("reports an invalid invite without saying why", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await acceptRunGuestInvite({ token: "t", userId: "u", email: "a@b.co" })).toEqual({
      status: "invalid",
    });
  });
});

describe("listRunsSharedWithGuest", () => {
  afterEach(() => {
    fromMock.mockReset();
  });

  it("lists the runs shared with the user, newest first, with the sharing workspace", async () => {
    const result = {
      data: [
        {
          created_at: "2026-09-29T10:00:00Z",
          run: { id: "run-1", claude_session_id: "session-1", workspace: { name: "Acme Agency" } },
        },
      ],
      error: null,
    };
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      order: vi.fn(() => Promise.resolve(result)),
    };
    fromMock.mockReturnValueOnce(query);

    expect(await listRunsSharedWithGuest("client-1")).toEqual([
      {
        runId: "run-1",
        claudeSessionId: "session-1",
        workspaceName: "Acme Agency",
        sharedAt: "2026-09-29T10:00:00Z",
      },
    ]);
    expect(fromMock).toHaveBeenCalledWith("run_guests");
    expect(query.eq).toHaveBeenCalledWith("user_id", "client-1");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("fails with the database error code only", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      order: vi.fn(() => Promise.resolve({ data: null, error: { code: "42501" } })),
    };
    fromMock.mockReturnValueOnce(query);

    await expect(listRunsSharedWithGuest("client-1")).rejects.toThrow(RunStoreError);
  });
});
