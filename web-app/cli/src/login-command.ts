import type { AimCredentials } from "./hook-forwarder.js";

export interface LoginDependencies {
  fetch: typeof fetch;
  sleep: (milliseconds: number) => Promise<void>;
  print: (line: string) => void;
  openBrowser: (url: string) => void;
  writeCredentials: (credentials: AimCredentials) => Promise<void>;
}

interface DeviceLoginResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
}

interface ClaimResponse {
  status: string;
  install_token?: string;
  workspace_id?: string;
}

const MILLISECONDS_PER_SECOND = 1000;
const HTTP_ACCEPTED = 202;

async function startDeviceLogin(
  apiUrl: string,
  deps: LoginDependencies,
): Promise<DeviceLoginResponse> {
  const response = await deps.fetch(`${apiUrl}/api/cli/device-logins`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Could not start login (HTTP ${String(response.status)})`);
  }
  return (await response.json()) as DeviceLoginResponse;
}

async function claimLogin(
  apiUrl: string,
  deviceCode: string,
  deps: LoginDependencies,
): Promise<{ httpStatus: number; claim: ClaimResponse }> {
  const response = await deps.fetch(`${apiUrl}/api/cli/device-logins/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_code: deviceCode }),
  });
  return { httpStatus: response.status, claim: (await response.json()) as ClaimResponse };
}

export async function loginCommand(apiUrl: string, deps: LoginDependencies): Promise<number> {
  const login = await startDeviceLogin(apiUrl, deps);
  deps.print(`Open ${login.verification_url}`);
  deps.print(`and confirm the code ${login.user_code} to connect this machine.`);
  deps.openBrowser(login.verification_url);

  const deadline = Date.now() + login.expires_in * MILLISECONDS_PER_SECOND;
  while (Date.now() < deadline) {
    const { httpStatus, claim } = await claimLogin(apiUrl, login.device_code, deps);
    if (claim.status === "approved" && claim.install_token && claim.workspace_id) {
      await deps.writeCredentials({
        apiUrl,
        installToken: claim.install_token,
        workspaceId: claim.workspace_id,
      });
      deps.print(
        "This machine is connected. Run `aim install` inside a project to share its sessions.",
      );
      return 0;
    }
    if (httpStatus !== HTTP_ACCEPTED) {
      deps.print(
        claim.status === "expired"
          ? "The code expired. Run `aim login` again."
          : "The login was not found. Run `aim login` again.",
      );
      return 1;
    }
    await deps.sleep(login.interval * MILLISECONDS_PER_SECOND);
  }
  deps.print("The code expired. Run `aim login` again.");
  return 1;
}
