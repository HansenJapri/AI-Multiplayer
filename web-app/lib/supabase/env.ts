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

function requireEnvValue(variableName: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new MissingEnvVarError(variableName);
  }
  return value;
}

export function readSupabasePublicEnv(): SupabasePublicEnv {
  // Each variable is read with a literal `process.env.X` access because Next.js only inlines
  // NEXT_PUBLIC_* values into the browser bundle for static property reads.
  return {
    url: requireEnvValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requireEnvValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
