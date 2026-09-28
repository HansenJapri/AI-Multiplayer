import type { NextRequest } from "next/server";
import { refreshSessionAndGuard } from "@/lib/supabase/proxy-session";

export function proxy(request: NextRequest) {
  return refreshSessionAndGuard(request);
}

export const config = {
  // Hook calls and health checks carry no browser session, so they skip the session refresh.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/hooks|api/cli|api/health).*)"],
};
