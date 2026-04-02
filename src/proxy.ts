import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv, SUPABASE_ENV_HINT } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[tamagotchi-web] ${SUPABASE_ENV_HINT}`);
      return NextResponse.next();
    }
    return new NextResponse(`Configuração em falta.\n\n${SUPABASE_ENV_HINT}`, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  let supabaseResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/play") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register") &&
    user
  ) {
    return NextResponse.redirect(new URL("/play", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/play/:path*", "/login", "/register"],
};
