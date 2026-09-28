// Where a signed-out visitor goes to sign in before returning to the page they asked for.
export function signInPath(returnTo: string): string {
  return `/login?next=${encodeURIComponent(returnTo)}`;
}
