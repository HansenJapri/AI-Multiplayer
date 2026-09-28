import { afterEach, describe, expect, it, vi } from "vitest";
import { createSupabaseBrowserClient } from "./browser-client";
import { MissingEnvVarError } from "./env";

const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn(() => ({ kind: "browser-client" })),
}));

vi.mock("@supabase/ssr", () => ({ createBrowserClient: createBrowserClientMock }));

const SAMPLE_URL = "https://sample-project.supabase.co";
const SAMPLE_ANON_KEY = "sample-anon-key";

describe("createSupabaseBrowserClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("creates the client from the public project URL and anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SAMPLE_URL);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SAMPLE_ANON_KEY);

    const client = createSupabaseBrowserClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(SAMPLE_URL, SAMPLE_ANON_KEY);
    expect(client).toEqual({ kind: "browser-client" });
  });

  it("refuses to create a client when the public env is incomplete", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SAMPLE_ANON_KEY);

    expect(() => createSupabaseBrowserClient()).toThrow(MissingEnvVarError);
    expect(createBrowserClientMock).not.toHaveBeenCalled();
  });
});
