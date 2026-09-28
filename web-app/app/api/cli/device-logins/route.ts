import type { NextRequest } from "next/server";
import { startDeviceLogin } from "@/lib/cli/device-login";
import { originFromHeaders } from "@/lib/http/request-origin";

// Anyone may start a login; nothing is granted until a signed-in member approves the user code.
export async function POST(request: NextRequest): Promise<Response> {
  const login = await startDeviceLogin(originFromHeaders(request.headers));
  return Response.json(
    {
      device_code: login.deviceCode,
      user_code: login.userCode,
      verification_url: login.verificationUrl,
      expires_in: login.expiresInSeconds,
      interval: login.intervalSeconds,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
