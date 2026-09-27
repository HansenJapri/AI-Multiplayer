import { afterEach, describe, expect, it, vi } from "vitest";
import { MissingEnvVarError, readSupabasePublicEnv } from "./env";

const SAMPLE_URL = "https://sample-project.supabase.co";
const SAMPLE_ANON_KEY = "sample-anon-key";

function stubPublicEnv(url: string | undefined, anonKey: string | undefined) {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
}

describe("readSupabasePublicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the project URL and anon key when both are set", () => {
    stubPublicEnv(SAMPLE_URL, SAMPLE_ANON_KEY);

    expect(readSupabasePublicEnv()).toEqual({ url: SAMPLE_URL, anonKey: SAMPLE_ANON_KEY });
  });

  it("names NEXT_PUBLIC_SUPABASE_URL when the URL is missing", () => {
    stubPublicEnv(undefined, SAMPLE_ANON_KEY);

    expect(() => readSupabasePublicEnv()).toThrow(
      new MissingEnvVarError("NEXT_PUBLIC_SUPABASE_URL"),
    );
  });

  it("names NEXT_PUBLIC_SUPABASE_ANON_KEY when the anon key is missing", () => {
    stubPublicEnv(SAMPLE_URL, undefined);

    expect(() => readSupabasePublicEnv()).toThrow(
      new MissingEnvVarError("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  });

  it("treats a blank value as missing", () => {
    stubPublicEnv("   ", SAMPLE_ANON_KEY);

    expect(() => readSupabasePublicEnv()).toThrow(MissingEnvVarError);
  });
});

describe("MissingEnvVarError", () => {
  it("mentions only the variable name so no secret value can leak into logs", () => {
    const error = new MissingEnvVarError("NEXT_PUBLIC_SUPABASE_URL");

    expect(error.name).toBe("MissingEnvVarError");
    expect(error.variableName).toBe("NEXT_PUBLIC_SUPABASE_URL");
    expect(error.message).toBe("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
