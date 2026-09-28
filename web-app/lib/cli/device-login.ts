import { randomInt } from "node:crypto";
import { generateOpaqueToken, hashOpaqueToken } from "@/lib/security/opaque-token";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

export const DEVICE_LOGIN_LIFETIME_SECONDS = 600;
export const DEVICE_LOGIN_POLL_INTERVAL_SECONDS = 3;

// No I, O, 0 or 1, so a code read aloud or typed by hand cannot be misread.
const USER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const USER_CODE_GROUP_LENGTH = 4;
const MAX_USER_CODE_ATTEMPTS = 3;
const UNIQUE_VIOLATION = "23505";

export interface DeviceLogin {
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  expiresInSeconds: number;
  intervalSeconds: number;
}

export type DeviceLoginClaim =
  | { status: "claimed"; installToken: string; workspaceId: string }
  | { status: "pending" }
  | { status: "expired" }
  | { status: "unknown" };

export class DeviceLoginStoreError extends Error {
  override readonly name = "DeviceLoginStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Device login storage failed (database error ${databaseErrorCode})`);
  }
}

function randomUserCodeGroup(): string {
  return Array.from(
    { length: USER_CODE_GROUP_LENGTH },
    () => USER_CODE_ALPHABET[randomInt(USER_CODE_ALPHABET.length)],
  ).join("");
}

export function generateUserCode(): string {
  return `${randomUserCodeGroup()}-${randomUserCodeGroup()}`;
}

export async function startDeviceLogin(origin: string): Promise<DeviceLogin> {
  const deviceCode = generateOpaqueToken();
  const supabase = createSupabaseAdminClient();
  let lastErrorCode = UNIQUE_VIOLATION;

  for (let attempt = 0; attempt < MAX_USER_CODE_ATTEMPTS; attempt += 1) {
    const userCode = generateUserCode();
    const { error } = await supabase.rpc("start_cli_device_login", {
      p_device_code_hash: hashOpaqueToken(deviceCode),
      p_user_code: userCode,
    });
    if (error === null) {
      const verificationUrl = new URL("/cli/activate", origin);
      verificationUrl.searchParams.set("code", userCode);
      return {
        deviceCode,
        userCode,
        verificationUrl: verificationUrl.toString(),
        expiresInSeconds: DEVICE_LOGIN_LIFETIME_SECONDS,
        intervalSeconds: DEVICE_LOGIN_POLL_INTERVAL_SECONDS,
      };
    }
    lastErrorCode = error.code;
    if (error.code !== UNIQUE_VIOLATION) {
      break;
    }
  }
  throw new DeviceLoginStoreError(lastErrorCode);
}

export async function approveDeviceLogin(
  userCode: string,
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const { data: approved, error } = await createSupabaseAdminClient().rpc(
    "approve_cli_device_login",
    { p_user_code: userCode.trim().toUpperCase(), p_user_id: userId, p_workspace_id: workspaceId },
  );
  if (error) {
    throw new DeviceLoginStoreError(error.code);
  }
  return approved;
}

async function readDeviceLoginStatus(deviceCodeHash: string): Promise<string> {
  const { data: status, error } = await createSupabaseAdminClient().rpc("cli_device_login_status", {
    p_device_code_hash: deviceCodeHash,
  });
  if (error) {
    throw new DeviceLoginStoreError(error.code);
  }
  return status;
}

export async function claimDeviceLogin(deviceCode: string): Promise<DeviceLoginClaim> {
  const deviceCodeHash = hashOpaqueToken(deviceCode);
  const status = await readDeviceLoginStatus(deviceCodeHash);
  if (status === "pending" || status === "expired") {
    return { status };
  }
  // "claimed" is reported as unknown so a replayed device code learns nothing about the login.
  if (status !== "approved") {
    return { status: "unknown" };
  }

  const installToken = generateOpaqueToken();
  const { data: workspaceId, error } = await createSupabaseAdminClient().rpc(
    "claim_cli_device_login",
    { p_device_code_hash: deviceCodeHash, p_install_token_hash: hashOpaqueToken(installToken) },
  );
  if (error) {
    throw new DeviceLoginStoreError(error.code);
  }
  // Null when a concurrent request claimed the login between the status read and this call.
  const claimedWorkspaceId = workspaceId as string | null;
  return claimedWorkspaceId === null
    ? { status: "unknown" }
    : { status: "claimed", installToken, workspaceId: claimedWorkspaceId };
}
