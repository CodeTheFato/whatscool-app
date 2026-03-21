import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const roleRoutes: Record<string, string> = {
  ADMIN: "/admin",
  SECRETARY: "/secretary",
  TEACHER: "/teacher",
  PARENT: "/parents",
}

const protectedPrefixes = ["/admin", "/secretary", "/teacher", "/parents"]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected) return NextResponse.next()

  // Não autenticado → login
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as string
  const allowedPrefix = roleRoutes[userRole]

  // Role errado → redireciona para a área correta
  if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/secretary/:path*", "/teacher/:path*", "/parents/:path*"],
}
