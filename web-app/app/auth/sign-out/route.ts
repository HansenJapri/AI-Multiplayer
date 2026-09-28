import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const HTTP_SEE_OTHER = 303;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // 303 turns the form POST into a GET of the home page.
  return NextResponse.redirect(new URL("/", request.url), HTTP_SEE_OTHER);
}
