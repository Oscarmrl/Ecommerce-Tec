import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                    req.nextUrl.pathname.startsWith("/register")
  
  // Si el usuario está autenticado y trata de acceder a login/register
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    "/account",
    "/cart",
    "/checkout",
    "/orders",
    "/wishlist",
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Si es una ruta protegida y no está autenticado
  if (isProtectedRoute && !isAuth) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}