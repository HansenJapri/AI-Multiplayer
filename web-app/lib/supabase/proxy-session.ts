import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readSupabasePublicEnv } from "./env";

const SIGNED_IN_AREA_PATH = "/app";
const LOGIN_PATH = "/login";

function isSignedInArea(pathname: string): boolean {
  return pathname === SIGNED_IN_AREA_PATH || pathname.startsWith(`${SIGNED_IN_AREA_PATH}/`);
}

function loginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

// Runs on every page request: refreshes the Supabase session cookies (Server Components cannot
// write cookies) and keeps signed-out visitors out of /app.
export async function refreshSessionAndGuard(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = readSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [headerName, headerValue] of Object.entries(cacheHeaders)) {
          response.headers.set(headerName, headerValue);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null && isSignedInArea(request.nextUrl.pathname)) {
    return loginRedirect(request);
  }
  return response;
}
