import { createHash, randomBytes } from "node:crypto";

const OPAQUE_TOKEN_BYTES = 32;

// Install and invite tokens are opaque bearer secrets: shown once, stored only as a hash.
export function generateOpaqueToken(): string {
  return randomBytes(OPAQUE_TOKEN_BYTES).toString("base64url");
}

// The tokens are random and high-entropy, so an unsalted SHA-256 digest is enough to make a
// leaked row useless while still allowing a direct lookup by hash.
export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
