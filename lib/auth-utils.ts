// lib/auth-utils.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ----------------------
// Tipos de roles
// ----------------------
export type UserRole = "USER" | "ADMIN";

// ----------------------
// Jerarquía de roles
// ----------------------
const roleHierarchy: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
};

// ----------------------
// Verificar si el usuario tiene el rol requerido
// ----------------------
export function hasRole(
  userRole: string | undefined,
  requiredRole: UserRole,
): boolean {
  if (!userRole) return false;

  const userLevel = roleHierarchy[userRole as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
}

// ----------------------
// Obtener sesión del servidor (NextAuth)
// ----------------------
export async function getServerSession() {
  return await auth();
}

// ----------------------
// Check de autorización en el servidor
// ----------------------
export async function checkAuth(requiredRole: UserRole = "USER") {
  const session = await getServerSession();

  if (!session?.user) {
    return {
      authorized: false,
      error: "No autenticado",
      session: null,
      user: null,
    };
  }

  const userRole = session.user.role as UserRole;
  const isAuthorized = hasRole(userRole, requiredRole);

  return {
    authorized: isAuthorized,
    error: isAuthorized ? null : "No autorizado",
    session,
    user: session.user,
  };
}

// ----------------------
// Middleware para proteger endpoints
// ----------------------
export function withRoleAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredRole: UserRole = "USER",
) {
  return async (req: NextRequest) => {
    try {
      const authResult = await checkAuth(requiredRole);

      if (!authResult.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error,
            message: `Se requiere rol ${requiredRole} para acceder a este recurso`,
          },
          { status: 403 },
        );
      }

      // ✅ Ejecuta el handler original
      return await handler(req);
    } catch (err) {
      console.error("Error en withRoleAuth:", err);
      return NextResponse.json(
        { success: false, error: "Error interno" },
        { status: 500 },
      );
    }
  };
}

// ----------------------
// Helper para componentes del cliente
// ----------------------
export function checkClientRole(
  userRole: string | undefined,
  requiredRole: UserRole,
): boolean {
  return hasRole(userRole, requiredRole);
}
