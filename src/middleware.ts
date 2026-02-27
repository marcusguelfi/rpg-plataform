import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

const PROTECTED = ['/dashboard', '/sheet', '/gm', '/campaigns', '/systems', '/import']
const AUTH_ONLY = ['/login', '/register'] // redirect if already authenticated

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))

  const token = request.cookies.get('session')?.value

  if (isProtected) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(url)
      response.cookies.delete('session')
      return response
    }
  }

  if (isAuthOnly && token) {
    const payload = await verifyToken(token)
    if (payload) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sheet/:path*',
    '/gm/:path*',
    '/campaigns/:path*',
    '/systems/:path*',
    '/import/:path*',
    '/login',
    '/register',
  ],
}
