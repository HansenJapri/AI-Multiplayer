import { createHash } from "node:crypto";

const BEARER_HEADER_PATTERN = /^Bearer\s+(\S+)$/i;

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (authorizationHeader === null) {
    return null;
  }
  const match = BEARER_HEADER_PATTERN.exec(authorizationHeader.trim());
  return match?.[1] ?? null;
}

// Install tokens are random and high-entropy, so an unsalted SHA-256 digest is enough to make a
// leaked cli_installs row useless while still allowing a direct lookup by hash.
export function hashInstallToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
