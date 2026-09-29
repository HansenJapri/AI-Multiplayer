import { storeHookEvent } from "@/lib/hooks/hook-event-store";
import { buildHookOutput } from "@/lib/hooks/hook-output";
import { parseHookPayload } from "@/lib/hooks/hook-payload";
import { extractBearerToken } from "@/lib/hooks/install-token";
import { hashOpaqueToken } from "@/lib/security/opaque-token";

// Bounds what one hook call can store; well under Vercel's 4.5 MB request limit, and far above
// a typical hook body. Claude Code treats the 413 as a non-blocking hook error.
const MAX_HOOK_BODY_BYTES = 1024 * 1024;

type HookBodyReadResult = { status: "too_large" } | { status: "read"; json: unknown };

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

function hookPayloadTooLargeResponse(): Response {
  return Response.json({ error: "hook_payload_too_large" }, { status: 413 });
}

function internalErrorResponse(): Response {
  return Response.json({ error: "internal_error" }, { status: 500 });
}

function parseJsonOrNull(text: string): unknown {
  try {
    const json: unknown = JSON.parse(text);
    return json;
  } catch {
    return null;
  }
}

async function readHookBody(request: Request): Promise<HookBodyReadResult> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_HOOK_BODY_BYTES) {
    return { status: "too_large" };
  }
  return { status: "read", json: parseJsonOrNull(text) };
}

export async function POST(request: Request): Promise<Response> {
  const installToken = extractBearerToken(request.headers.get("authorization"));
  if (installToken === null) {
    return unauthorizedResponse();
  }

  const hookBody = await readHookBody(request);
  if (hookBody.status === "too_large") {
    return hookPayloadTooLargeResponse();
  }

  const payload = parseHookPayload(hookBody.json);
  if (payload === null) {
    return invalidHookPayloadResponse();
  }

  try {
    const result = await storeHookEvent(hashOpaqueToken(installToken), payload);
    // Claude Code reads a 2xx body as hook output: it may hold the run or carry teammates' messages.
    return result.status === "stored"
      ? Response.json(buildHookOutput(payload.hookEventName, result.directive))
      : unauthorizedResponse();
  } catch (error) {
    // Log only the error message: it never contains the token, and store errors omit the payload.
    console.error("Hook ingest failed:", error instanceof Error ? error.message : "unknown error");
    return internalErrorResponse();
  }
}
