// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseAdminClient } from "./admin-client";
import { MissingEnvVarError } from "./env";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({ kind: "admin-client" })),
}));

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient: createClientMock }));

const SAMPLE_URL = "https://sample-project.supabase.co";
const SAMPLE_SERVICE_ROLE_KEY = "sample-service-role-key";

describe("createSupabaseAdminClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SAMPLE_URL);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SAMPLE_SERVICE_ROLE_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("creates a stateless client from the project URL and service role key", () => {
    const client = createSupabaseAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(SAMPLE_URL, SAMPLE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    expect(client).toEqual({ kind: "admin-client" });
  });

  it("does not need the anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);

    expect(() => createSupabaseAdminClient()).not.toThrow();
  });

  it("names SUPABASE_SERVICE_ROLE_KEY when the key is missing", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);

    expect(() => createSupabaseAdminClient()).toThrow(
      new MissingEnvVarError("SUPABASE_SERVICE_ROLE_KEY"),
    );
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("names NEXT_PUBLIC_SUPABASE_URL when the URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);

    expect(() => createSupabaseAdminClient()).toThrow(
      new MissingEnvVarError("NEXT_PUBLIC_SUPABASE_URL"),
    );
  });
});
