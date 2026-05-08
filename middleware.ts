import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const userRole = token?.role as string | undefined;
  const isAdmin = userRole === "ADMIN";
  
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Si el usuario está autenticado y trata de acceder a login/register
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    "/account",
    "/cart",
    "/checkout",
    "/orders",
    "/wishlist",
    "/admin", // Agregar rutas admin
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  // Verificar si es ruta admin
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Si es una ruta protegida y no está autenticado
  // Excluir rutas API (deben manejar autenticación ellas mismas)
  if (isProtectedRoute && !isAuth && !req.nextUrl.pathname.startsWith("/api")) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url),
    );
  }

  // Si es ruta admin, verificar rol ADMIN
  if (isAdminRoute && isAuth && !isAdmin) {
    // Usuario autenticado pero no es ADMIN
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
