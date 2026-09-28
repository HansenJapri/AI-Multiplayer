// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { loginCommand, type LoginDependencies } from "./login-command.js";

const API_URL = "https://ai-multiplayer.vercel.app";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

const DEVICE_LOGIN = {
  device_code: "device-code",
  user_code: "ABCD-EFGH",
  verification_url: `${API_URL}/cli/activate?code=ABCD-EFGH`,
  expires_in: 600,
  interval: 3,
};

function dependencies(claimReplies: Response[]): LoginDependencies & {
  printed: string[];
} {
  const printed: string[] = [];
  const fetchMock = vi.fn((url: string) =>
    Promise.resolve(
      url.endsWith("/claim")
        ? (claimReplies.shift() ?? jsonResponse(404, {}))
        : jsonResponse(200, DEVICE_LOGIN),
    ),
  );
  return {
    printed,
    fetch: fetchMock as unknown as typeof fetch,
    sleep: vi.fn(() => Promise.resolve()),
    print: (line: string) => printed.push(line),
    openBrowser: vi.fn(),
    writeCredentials: vi.fn(() => Promise.resolve()),
  };
}

describe("loginCommand", () => {
  it("shows the code, waits for approval and saves the issued install token", async () => {
    const deps = dependencies([
      jsonResponse(202, { status: "pending" }),
      jsonResponse(200, {
        status: "approved",
        install_token: "install-token",
        workspace_id: "workspace-1",
      }),
    ]);

    const exitCode = await loginCommand(API_URL, deps);

    expect(exitCode).toBe(0);
    expect(deps.printed.join("\n")).toContain("ABCD-EFGH");
    expect(deps.openBrowser).toHaveBeenCalledWith(DEVICE_LOGIN.verification_url);
    expect(deps.sleep).toHaveBeenCalledWith(3000);
    expect(deps.writeCredentials).toHaveBeenCalledWith({
      apiUrl: API_URL,
      installToken: "install-token",
      workspaceId: "workspace-1",
    });
  });

  it("stops with an error when the code expires", async () => {
    const deps = dependencies([jsonResponse(410, { status: "expired" })]);

    expect(await loginCommand(API_URL, deps)).toBe(1);
    expect(deps.writeCredentials).not.toHaveBeenCalled();
    expect(deps.printed.join("\n")).toContain("expired");
  });

  it("stops with an error when the server does not know the login", async () => {
    const deps = dependencies([jsonResponse(404, { status: "unknown" })]);

    expect(await loginCommand(API_URL, deps)).toBe(1);
  });
});
