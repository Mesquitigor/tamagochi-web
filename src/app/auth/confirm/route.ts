import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const CONFIRM_OK = "/email-confirmed";
const CONFIRM_FAIL = "/login?error=confirmacao";

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const okRedirect = NextResponse.redirect(
    new URL(CONFIRM_OK, request.nextUrl.origin),
  );
  const failRedirect = NextResponse.redirect(
    new URL(CONFIRM_FAIL, request.nextUrl.origin),
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? failRedirect : okRedirect;
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    return error ? failRedirect : okRedirect;
  }

  return failRedirect;
}
