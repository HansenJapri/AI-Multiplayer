import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { Json } from "@/lib/supabase/database.types";
import type { HookDirective } from "./hook-output";
import type { HookPayload } from "./hook-payload";

export type StoreHookEventResult =
  | { status: "stored"; hookEventId: string; directive: HookDirective }
  | { status: "unknown_install_token" };

export class HookEventStoreError extends Error {
  override readonly name = "HookEventStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Failed to store hook event (database error ${databaseErrorCode})`);
  }
}

// Shape of the jsonb that ingest_hook_event returns.
interface IngestResult {
  hook_event_id: string;
  hold: { raised_by_email: string; reason: string } | null;
  steer_messages: { author_email: string; body: string }[];
}

function toDirective(result: IngestResult): HookDirective {
  return {
    hold:
      result.hold === null
        ? null
        : { raisedByEmail: result.hold.raised_by_email, reason: result.hold.reason },
    steerMessages: result.steer_messages.map(({ author_email: authorEmail, body }) => ({
      authorEmail,
      body,
    })),
  };
}

export async function storeHookEvent(
  tokenHash: string,
  payload: HookPayload,
): Promise<StoreHookEventResult> {
  const { data, error } = await createSupabaseAdminClient().rpc("ingest_hook_event", {
    p_token_hash: tokenHash,
    p_claude_session_id: payload.claudeSessionId,
    p_hook_event_name: payload.hookEventName,
    // The body came from request.json(), so every value in it is already JSON.
    p_payload: payload.body as Json,
  });

  if (error) {
    throw new HookEventStoreError(error.code);
  }
  // Null when the token is unknown or revoked; otherwise the jsonb built by the database.
  const result = data as IngestResult | null;
  if (result === null) {
    return { status: "unknown_install_token" };
  }
  return {
    status: "stored",
    hookEventId: result.hook_event_id,
    directive: toDirective(result),
  };
}
