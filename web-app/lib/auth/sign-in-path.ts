// Where a signed-out visitor goes to sign in before returning to the page they asked for.
export function signInPath(returnTo: string): string {
  return withNextPath("/login", returnTo);
}

// Carries the page to return to between the sign-in and sign-up pages.
export function withNextPath(path: string, returnTo: string | null): string {
  return returnTo === null ? path : `${path}?next=${encodeURIComponent(returnTo)}`;
}
