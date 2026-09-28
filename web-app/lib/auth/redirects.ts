export const SIGNED_IN_HOME_PATH = "/app";

// Only same-site paths are allowed as post-login targets, otherwise the login link becomes an
// open redirect. "//host" and "/\host" are treated by browsers as other origins.
export function safeRedirectPath(target: string | null): string {
  if (
    target === null ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.startsWith("/\\")
  ) {
    return SIGNED_IN_HOME_PATH;
  }
  return target;
}

export function buildAuthCallbackUrl(origin: string, nextPath: string | null): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", safeRedirectPath(nextPath));
  return callbackUrl.toString();
}
