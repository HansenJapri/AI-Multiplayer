import { readFormText } from "@/lib/http/form-data";
import { parseEmailAddress } from "./email";

// Matches minimum_password_length in supabase/config.toml.
export const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores everything after 72 bytes, so a longer password would not mean what it says.
const MAX_PASSWORD_BYTES = 72;

export type ParsedCredentials =
  | { ok: true; email: string; password: string }
  | { ok: false; reason: "invalid_email" | "weak_password" };

export function parseCredentials(formData: FormData): ParsedCredentials {
  const email = parseEmailAddress(readFormText(formData, "email"));
  if (email === null) {
    return { ok: false, reason: "invalid_email" };
  }
  const password = readFormText(formData, "password") ?? "";
  const passwordBytes = new TextEncoder().encode(password).length;
  if (password.length < MIN_PASSWORD_LENGTH || passwordBytes > MAX_PASSWORD_BYTES) {
    return { ok: false, reason: "weak_password" };
  }
  return { ok: true, email, password };
}
