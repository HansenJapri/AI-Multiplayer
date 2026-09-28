import type { NextRequest } from "next/server";
import { claimDeviceLogin, type DeviceLoginClaim } from "@/lib/cli/device-login";

const HTTP_STATUS_BY_UNCLAIMED_STATUS: Record<
  Exclude<DeviceLoginClaim["status"], "claimed">,
  number
> = {
  pending: 202,
  expired: 410,
  unknown: 404,
};

async function readDeviceCode(request: NextRequest): Promise<string | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "device_code" in body) {
      const { device_code: deviceCode } = body;
      return typeof deviceCode === "string" && deviceCode !== "" ? deviceCode : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const deviceCode = await readDeviceCode(request);
  if (deviceCode === null) {
    return Response.json({ error: "device_code_required" }, { status: 400 });
  }

  const claim = await claimDeviceLogin(deviceCode);
  if (claim.status !== "claimed") {
    return Response.json(
      { status: claim.status },
      { status: HTTP_STATUS_BY_UNCLAIMED_STATUS[claim.status] },
    );
  }
  // The install token leaves the server exactly once, in this response.
  return Response.json(
    { status: "approved", install_token: claim.installToken, workspace_id: claim.workspaceId },
    { headers: { "Cache-Control": "no-store" } },
  );
}
