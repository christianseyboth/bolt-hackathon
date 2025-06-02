// middleware.ts
export const runtime = "edge"; // explizit Edge-Runtime erzwingen

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1) Lege ein NextResponse.next() an, um Cookies in der Antwort zu setzen
  const response = NextResponse.next();

  // 2) Supabase-Client mit Cookie-Handler für Edge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          // Übergebe hier alle Optionen, damit HttpOnly, SameSite, etc. erhalten bleiben
          response.cookies.set({
            name,
            value,
            // options könnte Typ: { path: string; maxAge: number; sameSite: "lax"|"strict", secure: boolean, httpOnly: boolean }
            httpOnly: options.httpOnly,
            maxAge: options.maxAge,
            path: options.path,
            sameSite: options.sameSite,
            secure: options.secure,
          });
        },
        remove: (name, options) => {
          // Um einen Cookie zu löschen, setze ihn auf leeren Wert und maxAge=0
          response.cookies.set({
            name,
            value: "",
            maxAge: 0,
            path: options?.path || "/",
          });
        },
      },
    }
  );

  // 3) Session abrufen (ggf. automatisch refresht Supabase intern den Token)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 4) Pfade checken
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password");

  // 5) Umleitung, falls nicht eingeloggt und auf Dashboard
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 6) Wenn eingeloggt und auf /login|/register|/reset-password -> /dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 7) Gib das Response-Objekt zurück, damit ggf. Cookies gesetzt werden
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login/:path*",
    "/register/:path*",
    "/reset-password/:path*",
  ],
};
