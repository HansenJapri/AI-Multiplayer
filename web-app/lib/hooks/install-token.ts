const BEARER_HEADER_PATTERN = /^Bearer\s+(\S+)$/i;

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (authorizationHeader === null) {
    return null;
  }
  const match = BEARER_HEADER_PATTERN.exec(authorizationHeader.trim());
  return match?.[1] ?? null;
}
