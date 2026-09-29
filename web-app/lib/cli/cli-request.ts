import { extractBearerToken } from "@/lib/hooks/install-token";
import { hashOpaqueToken } from "@/lib/security/opaque-token";

// Shared by the CLI endpoints: the install token hash from the Authorization header, and the
// JSON object body. Both return null when missing or malformed.

export function installTokenHash(request: Request): string | null {
  const installToken = extractBearerToken(request.headers.get("authorization"));
  return installToken === null ? null : hashOpaqueToken(installToken);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function nonEmptyText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function unauthorizedCliResponse(): Response {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
  );
}

export function invalidCliRequestResponse(): Response {
  return Response.json({ error: "invalid_request" }, { status: 400 });
}
