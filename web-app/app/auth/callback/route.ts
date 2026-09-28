import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function invalidLinkRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login?error=link_invalid", request.url));
}

// Magic links land here with a one-time PKCE code; exchanging it writes the session cookies.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  if (code === null) {
    return invalidLinkRedirect(request);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return invalidLinkRedirect(request);
  }

  const nextPath = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(nextPath, request.url));
}
