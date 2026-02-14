import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";

// GET: Obtener todas las categorías (público)
async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    
    // Formatear respuesta
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      parent: category.parent,
      children: category.children,
      productCount: category._count.products,
      createdAt: category.createdAt,
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
    
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}

// POST: Crear nueva categoría (solo ADMIN)
async function createCategory(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar datos requeridos
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Nombre y slug son requeridos" },
        { status: 400 }
      );
    }
    
    // Crear categoría
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        icon: body.icon,
        parentId: body.parentId,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: category,
      message: "Categoría creada exitosamente",
    });
    
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    
    // Manejar error de slug duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El slug ya está en uso" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}

// Exportar handlers con protección de roles
const protectedPOST = withRoleAuth(createCategory, "ADMIN");

export { GET };
export const POST = protectedPOST;