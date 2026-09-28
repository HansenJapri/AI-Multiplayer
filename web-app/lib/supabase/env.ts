export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export class MissingEnvVarError extends Error {
  override readonly name = "MissingEnvVarError";

  constructor(readonly variableName: string) {
    super(`Missing required environment variable: ${variableName}`);
  }
}

export function requireEnvValue(variableName: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new MissingEnvVarError(variableName);
  }
  return value;
}

// Every variable is read with a literal `process.env.X` access because Next.js only inlines
// NEXT_PUBLIC_* values into the browser bundle for static property reads.
export function readSupabaseUrl(): string {
  return requireEnvValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function readSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: readSupabaseUrl(),
    anonKey: requireEnvValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
