// @vitest-environment node
import type { CookieMethodsServer } from "@supabase/ssr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "./server-client";

interface ServerClientOptions {
  cookies: CookieMethodsServer;
}

const { createServerClientMock, requestCookieStore } = vi.hoisted(() => ({
  createServerClientMock: vi.fn<
    (url: string, anonKey: string, options: ServerClientOptions) => { kind: string }
  >(() => ({ kind: "server-client" })),
  requestCookieStore: {
    getAll: vi.fn(() => [{ name: "sb-session", value: "session-cookie" }]),
    set: vi.fn(),
  },
}));

vi.mock("@supabase/ssr", () => ({ createServerClient: createServerClientMock }));
vi.mock("next/headers", () => ({ cookies: () => Promise.resolve(requestCookieStore) }));

const SAMPLE_URL = "https://sample-project.supabase.co";
const SAMPLE_ANON_KEY = "sample-anon-key";
const SAMPLE_COOKIE = { name: "sb-session", value: "refreshed", options: { path: "/" } };

async function createClientAndCaptureCookieMethods(): Promise<CookieMethodsServer> {
  await createSupabaseServerClient();
  const options = createServerClientMock.mock.calls[0]?.[2];
  if (options === undefined) {
    throw new Error("createServerClient was not called");
  }
  return options.cookies;
}

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SAMPLE_URL);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SAMPLE_ANON_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("creates the client from the public project URL and anon key", async () => {
    const client = await createSupabaseServerClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      SAMPLE_URL,
      SAMPLE_ANON_KEY,
      expect.objectContaining({ cookies: expect.any(Object) as unknown }),
    );
    expect(client).toEqual({ kind: "server-client" });
  });

  it("reads auth cookies from the incoming request", async () => {
    const cookieMethods = await createClientAndCaptureCookieMethods();

    expect(await cookieMethods.getAll()).toEqual([{ name: "sb-session", value: "session-cookie" }]);
  });

  it("writes refreshed auth cookies to the response", async () => {
    const cookieMethods = await createClientAndCaptureCookieMethods();

    await cookieMethods.setAll?.([SAMPLE_COOKIE], {});

    expect(requestCookieStore.set).toHaveBeenCalledWith(
      SAMPLE_COOKIE.name,
      SAMPLE_COOKIE.value,
      SAMPLE_COOKIE.options,
    );
  });

  it("ignores cookie writes that Next.js rejects during Server Component rendering", async () => {
    requestCookieStore.set.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler.");
    });
    const cookieMethods = await createClientAndCaptureCookieMethods();

    expect(() => cookieMethods.setAll?.([SAMPLE_COOKIE], {})).not.toThrow();
  });
});
