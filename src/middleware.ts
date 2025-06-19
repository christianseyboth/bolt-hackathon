// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always update Supabase session first
  const response = await updateSession(request)

  // Skip additional middleware logic for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return response
  }

  // For all other routes, return the Supabase response (which handles auth)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API and static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
