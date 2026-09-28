import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { Json } from "@/lib/supabase/database.types";
import type { HookPayload } from "./hook-payload";

export type StoreHookEventResult =
  { status: "stored"; hookEventId: string } | { status: "unknown_install_token" };

export class HookEventStoreError extends Error {
  override readonly name = "HookEventStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Failed to store hook event (database error ${databaseErrorCode})`);
  }
}

export async function storeHookEvent(
  tokenHash: string,
  payload: HookPayload,
): Promise<StoreHookEventResult> {
  const { data: hookEventId, error } = await createSupabaseAdminClient().rpc("ingest_hook_event", {
    p_token_hash: tokenHash,
    p_claude_session_id: payload.claudeSessionId,
    p_hook_event_name: payload.hookEventName,
    // The body came from request.json(), so every value in it is already JSON.
    p_payload: payload.body as Json,
  });

  if (error) {
    throw new HookEventStoreError(error.code);
  }
  // The generated type says string, but the function returns null for an unknown or revoked token.
  const storedHookEventId = hookEventId as string | null;
  return storedHookEventId === null
    ? { status: "unknown_install_token" }
    : { status: "stored", hookEventId: storedHookEventId };
}
