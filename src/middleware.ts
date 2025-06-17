import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for home page to avoid clientModules error
  if (request.nextUrl.pathname === '/') {
    return;
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
     * - / (home page) - ADDED THIS
     */
    '/((?!_next/static|_next/image|favicon.ico|^/$).*)',
  ],
}
