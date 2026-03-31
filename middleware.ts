import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'

  // Not logged in → redirect to login (except if already there)
  if (!session?.value && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Already logged in → redirect away from login
  if (session?.value && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
