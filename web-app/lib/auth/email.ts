const EMAIL_ADDRESS_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function parseEmailAddress(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const emailAddress = value.trim().toLowerCase();
  return EMAIL_ADDRESS_PATTERN.test(emailAddress) ? emailAddress : null;
}
