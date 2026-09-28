// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HookPayload } from "./hook-payload";
import { HookEventStoreError, storeHookEvent } from "./hook-event-store";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));

const TOKEN_HASH = "a".repeat(64);
const STOP_PAYLOAD: HookPayload = {
  claudeSessionId: "session-1",
  hookEventName: "Stop",
  body: { session_id: "session-1", hook_event_name: "Stop" },
};

describe("storeHookEvent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("stores the hook through ingest_hook_event and returns the new hook event id", async () => {
    rpcMock.mockResolvedValueOnce({ data: "hook-event-id", error: null });

    const result = await storeHookEvent(TOKEN_HASH, STOP_PAYLOAD);

    expect(rpcMock).toHaveBeenCalledWith("ingest_hook_event", {
      p_token_hash: TOKEN_HASH,
      p_claude_session_id: "session-1",
      p_hook_event_name: "Stop",
      p_payload: STOP_PAYLOAD.body,
    });
    expect(result).toEqual({ status: "stored", hookEventId: "hook-event-id" });
  });

  it("reports an unknown or revoked install token when nothing was stored", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await storeHookEvent(TOKEN_HASH, STOP_PAYLOAD)).toEqual({
      status: "unknown_install_token",
    });
  });

  it("fails with only the database error code so payload details never reach the logs", async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { code: "23514", message: "check violation", details: "Failing row contains ..." },
    });

    const failure = storeHookEvent(TOKEN_HASH, STOP_PAYLOAD);

    await expect(failure).rejects.toThrow(HookEventStoreError);
    await expect(failure).rejects.toThrow("Failed to store hook event (database error 23514)");
  });
});
