import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware entirely for home page to avoid clientModules error
  if (request.nextUrl.pathname === '/') {
    return;
  }

  // Get the locale from URL parameter first
  const localeFromUrl = request.nextUrl.searchParams.get('locale');
  if (localeFromUrl && ['en', 'es', 'fr', 'de'].includes(localeFromUrl)) {
    return NextResponse.next();
  }

  // Get browser's preferred language
  const acceptLanguage = request.headers.get('accept-language') || '';
  const supportedLocales = ['es', 'fr', 'de', 'en'];

  // Simple language detection
  for (const locale of supportedLocales) {
    if (acceptLanguage.includes(locale)) {
      const url = request.nextUrl.clone();
      url.searchParams.set('locale', locale);
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (home page) - EXPLICITLY EXCLUDED
     */
    '/((?!_next/static|_next/image|favicon.ico|^/$).*)',
  ],
}
