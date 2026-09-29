function firstHeaderValue(headers: Headers, name: string): string | null {
  const value = headers.get(name);
  return value === null ? null : (value.split(",")[0]?.trim() ?? null);
}

// Links sent by email or shared by hand (invites, guest links) must point back at the host the user is on,
// which behind Vercel's proxy is only visible in the x-forwarded-* headers.
export function originFromHeaders(headers: Headers): string {
  const host = firstHeaderValue(headers, "x-forwarded-host") ?? firstHeaderValue(headers, "host");
  if (host === null || host === "") {
    throw new Error("Request has no host header");
  }
  const protocol = firstHeaderValue(headers, "x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
