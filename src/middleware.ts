import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'es', 'fr', 'de']
const defaultLocale = 'en'

function getLocaleFromHeaders(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale

  const preferredLocales = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim().toLowerCase())
    .map((lang) => lang.split('-')[0]) // Convert 'en-US' to 'en'

  for (const preferredLocale of preferredLocales) {
    if (locales.includes(preferredLocale)) {
      return preferredLocale
    }
  }

  return defaultLocale
}

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (potentialLocale && locales.includes(potentialLocale)) {
    return potentialLocale
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Skip middleware for API routes, static files, _next, and dashboard routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/setup-account') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/pricing') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const localeInPath = getLocaleFromPathname(pathname)

  // If we already have a valid locale in the path, continue
  if (localeInPath) {
    console.log('🌍 Middleware: Found locale in path:', localeInPath)
    return NextResponse.next()
  }

  // For root path, detect locale and redirect
  if (pathname === '/') {
    // Check for locale preference in cookie first
    const localeFromCookie = request.cookies.get('locale')?.value

    // Then check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language')

    const locale = (localeFromCookie && locales.includes(localeFromCookie))
      ? localeFromCookie
      : getLocaleFromHeaders(acceptLanguage)

    console.log('🌍 Middleware: Redirecting root to locale:', locale)

    // Redirect to the detected locale
    const redirectUrl = new URL(`/${locale}${search}`, request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Set locale cookie for future visits
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
  }

  // For other paths without locale, redirect to default locale
  if (!localeInPath) {
    console.log('🌍 Middleware: No locale in path, redirecting to default')
    const redirectUrl = new URL(`/${defaultLocale}${pathname}${search}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - dashboard (dashboard routes)
     * - auth (auth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|dashboard|auth|login|register|reset-password|setup-account|contact|pricing).*)',
  ],
}
