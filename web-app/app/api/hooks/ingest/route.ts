import { storeHookEvent } from "@/lib/hooks/hook-event-store";
import { parseHookPayload } from "@/lib/hooks/hook-payload";
import { extractBearerToken, hashInstallToken } from "@/lib/hooks/install-token";

// Missing, malformed, unknown and revoked tokens share one answer so callers cannot probe tokens.
function unauthorizedResponse(): Response {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
  );
}

function invalidHookPayloadResponse(): Response {
  return Response.json({ error: "invalid_hook_payload" }, { status: 400 });
}

function internalErrorResponse(): Response {
  return Response.json({ error: "internal_error" }, { status: 500 });
}

// Claude Code reads a 2xx body as hook output; an empty object means "no decision, continue".
function emptyHookOutputResponse(): Response {
  return Response.json({});
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    const body: unknown = await request.json();
    return body;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const installToken = extractBearerToken(request.headers.get("authorization"));
  if (installToken === null) {
    return unauthorizedResponse();
  }

  const payload = parseHookPayload(await readJsonBody(request));
  if (payload === null) {
    return invalidHookPayloadResponse();
  }

  try {
    const result = await storeHookEvent(hashInstallToken(installToken), payload);
    return result.status === "stored" ? emptyHookOutputResponse() : unauthorizedResponse();
  } catch (error) {
    // Log only the error message: it never contains the token, and store errors omit the payload.
    console.error("Hook ingest failed:", error instanceof Error ? error.message : "unknown error");
    return internalErrorResponse();
  }
}
