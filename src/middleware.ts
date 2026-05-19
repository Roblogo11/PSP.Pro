import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Forward the current pathname so server layouts can read it
  const response = NextResponse.next()
  response.headers.set('x-next-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
