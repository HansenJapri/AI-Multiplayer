// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunStoreError } from "./runs";
import { holdRun, queueSteerMessage, releaseRun } from "./steering";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));

describe("queueSteerMessage", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("queues the message for the agent", async () => {
    rpcMock.mockResolvedValueOnce({ data: "message-1", error: null });

    expect(await queueSteerMessage({ runId: "run-1", authorId: "user-1", body: "Use X" })).toBe(
      true,
    );
    expect(rpcMock).toHaveBeenCalledWith("queue_steer_message", {
      p_run_id: "run-1",
      p_author_id: "user-1",
      p_body: "Use X",
    });
  });

  it("reports a refused message", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await queueSteerMessage({ runId: "r", authorId: "u", body: "x" })).toBe(false);
  });
});

describe("holdRun and releaseRun", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("holds the run with the reason", async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });

    expect(await holdRun({ runId: "run-1", userId: "user-1", reason: "Reviewing" })).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("raise_run_hold", {
      p_run_id: "run-1",
      p_user_id: "user-1",
      p_reason: "Reviewing",
    });
  });

  it("releases the run", async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });

    expect(await releaseRun({ runId: "run-1", userId: "user-1" })).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("release_run_hold", {
      p_run_id: "run-1",
      p_user_id: "user-1",
    });
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "check" } });

    await expect(holdRun({ runId: "r", userId: "u", reason: "x".repeat(600) })).rejects.toThrow(
      RunStoreError,
    );
  });
});
