// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { HookEventStoreError } from "@/lib/hooks/hook-event-store";
import { hashInstallToken } from "@/lib/hooks/install-token";
import { POST } from "./route";

const { storeHookEventMock } = vi.hoisted(() => ({ storeHookEventMock: vi.fn() }));

vi.mock("@/lib/hooks/hook-event-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/hooks/hook-event-store")>()),
  storeHookEvent: storeHookEventMock,
}));

const INSTALL_TOKEN = "aim_install_token_value";
const STOP_BODY = { session_id: "session-1", hook_event_name: "Stop", cwd: "/home/dev/project" };

function hookRequest(options: { authorization?: string; body: string }): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.authorization !== undefined) {
    headers.set("Authorization", options.authorization);
  }
  return new Request("http://localhost/api/hooks/ingest", {
    method: "POST",
    headers,
    body: options.body,
  });
}

function authorizedHookRequest(body: string = JSON.stringify(STOP_BODY)): Request {
  return hookRequest({ authorization: `Bearer ${INSTALL_TOKEN}`, body });
}

describe("POST /api/hooks/ingest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    storeHookEventMock.mockReset();
  });

  it("stores the hook under the hashed install token and answers with an empty hook output", async () => {
    storeHookEventMock.mockResolvedValueOnce({ status: "stored", hookEventId: "hook-event-id" });

    const response = await POST(authorizedHookRequest());

    expect(storeHookEventMock).toHaveBeenCalledWith(hashInstallToken(INSTALL_TOKEN), {
      claudeSessionId: "session-1",
      hookEventName: "Stop",
      body: STOP_BODY,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
  });

  it("rejects a request without a Bearer token before touching the database", async () => {
    const response = await POST(hookRequest({ body: JSON.stringify(STOP_BODY) }));

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(await response.json()).toEqual({ error: "unauthorized" });
    expect(storeHookEventMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown or revoked install token with the same answer as a missing one", async () => {
    storeHookEventMock.mockResolvedValueOnce({ status: "unknown_install_token" });

    const response = await POST(authorizedHookRequest());

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("rejects a body that is not valid JSON", async () => {
    const response = await POST(authorizedHookRequest("{not json"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_hook_payload" });
    expect(storeHookEventMock).not.toHaveBeenCalled();
  });

  it("rejects a hook the MVP does not accept", async () => {
    const notification = JSON.stringify({
      session_id: "session-1",
      hook_event_name: "Notification",
    });

    const response = await POST(authorizedHookRequest(notification));

    expect(response.status).toBe(400);
    expect(storeHookEventMock).not.toHaveBeenCalled();
  });

  it("answers 500 without details and never logs the token when storing fails", async () => {
    storeHookEventMock.mockRejectedValueOnce(new HookEventStoreError("08006"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(authorizedHookRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "internal_error" });
    expect(consoleError).toHaveBeenCalledOnce();
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(INSTALL_TOKEN);
  });
});
