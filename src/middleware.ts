// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware entirely for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Only apply Supabase session middleware to authenticated routes
  const authRequiredPaths = [
    '/dashboard',
    '/account',
    '/setup-account',
    '/api-keys'
  ]

  const needsAuth = authRequiredPaths.some(path => pathname.startsWith(path))

  if (needsAuth) {
    try {
      const response = await updateSession(request)
      return response
    } catch (error) {
      console.error('Auth middleware error:', error)
      // Redirect to login on auth error
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // For public routes (home page, pricing, etc.), just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API and static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
