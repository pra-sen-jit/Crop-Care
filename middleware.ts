import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/settings']
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  // Redirect authenticated users away from auth pages
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Redirect unauthenticated users away from protected pages
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  // CSRF protection
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}