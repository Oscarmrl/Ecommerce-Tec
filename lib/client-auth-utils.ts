// lib/client-auth-utils.ts
// Utilidades de autenticación para uso en componentes del cliente

export type UserRole = "USER" | "ADMIN";

// Jerarquía de roles
const roleHierarchy: Record<UserRole, number> = {
  USER: 1,
  ADMIN: 2,
};

// Verificar si el usuario tiene el rol requerido
function hasRole(userRole: string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;

  const userLevel = roleHierarchy[userRole as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
}

// Helper para componentes del cliente
export function checkClientRole(
  userRole: string | undefined,
  requiredRole: UserRole,
): boolean {
  return hasRole(userRole, requiredRole);
}