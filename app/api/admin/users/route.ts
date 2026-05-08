import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

// GET: Obtener todos los usuarios (solo ADMIN)
async function getUsers(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parámetros de paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;
    
    // Filtros
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const email = searchParams.get("email");
    const isActive = searchParams.get("isActive");
    
    // Construir filtro WHERE
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (role && (role === "USER" || role === "ADMIN")) {
      where.role = role;
    }
    
    if (email) {
      where.email = { contains: email, mode: "insensitive" };
    }
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    // Ordenamiento
    const orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    if (sortBy === "email") {
      orderBy.email = sortOrder as "asc" | "desc";
    } else if (sortBy === "name") {
      orderBy.name = sortOrder as "asc" | "desc";
    } else if (sortBy === "lastLogin") {
      orderBy.lastLogin = sortOrder as "asc" | "desc";
    } else if (sortBy === "isActive") {
      orderBy.isActive = sortOrder as "asc" | "desc";
    } else if (sortBy === "role") {
      orderBy.role = sortOrder as "asc" | "desc";
    }
    
    // Query paralela: usuarios y total
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          phone: true,
          // Excluir campos sensibles como password
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    // Formatear respuesta
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      isActive: user.isActive,
      emailVerified: !!user.emailVerified, // Convertir DateTime a boolean
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      phone: user.phone,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      message: `Usuarios obtenidos (${users.length})`,
    });
  } catch (error) {
    console.error("Error en API admin/users GET:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener usuarios",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// PATCH: Actualizar rol de usuario (solo ADMIN)
async function updateUserRole(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido" },
        { status: 400 },
      );
    }
    
    const body = await req.json();
    const { role, isActive } = body;
    
    if (role === undefined && isActive === undefined) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un campo para actualizar (role, isActive)" },
        { status: 400 },
      );
    }
    
    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 },
      );
    }
    
    // No permitir modificar el propio usuario (opcional, se puede quitar)
    // const session = await getServerSession();
    // if (session?.user?.id === userId) {
    //   return NextResponse.json(
    //     { success: false, error: "No puedes modificar tu propio rol" },
    //     { status: 403 },
    //   );
    // }
    
    // Preparar datos de actualización
    const updateData: any = {};
    if (role && (role === "USER" || role === "ADMIN")) {
      updateData.role = role;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en API admin/users PATCH:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar usuario",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// Exportar handlers protegidos por rol ADMIN
export const GET = withRoleAuth(getUsers, "ADMIN");
export const PATCH = withRoleAuth(updateUserRole, "ADMIN");