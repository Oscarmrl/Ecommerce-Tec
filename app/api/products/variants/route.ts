// app/api/products/variants/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

// ----------------------
// GET: Obtener variantes de un producto
// ----------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ID del producto requerido" },
        { status: 400 },
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { name: "asc" },
    });

    // Formatear para el frontend (Decimal -> string)
    const formattedVariants = variants.map((variant) => ({
      ...variant,
      price: variant.price?.toString() ?? null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedVariants,
    });
  } catch (error) {
    console.error("Error al obtener variantes:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener variantes" },
      { status: 500 },
    );
  }
}

// ----------------------
// POST: Crear variante (solo ADMIN)
// ----------------------
async function createVariant(req: NextRequest) {
  try {
    const body = await req.json();

    // Validaciones
    const requiredFields = ["productId", "name", "value"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido: ${field}` },
          { status: 400 },
        );
      }
    }

    // Verificar que el producto exista
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Crear variante
    const variant = await prisma.productVariant.create({
      data: {
        productId: body.productId,
        name: body.name,
        value: body.value,
        price: body.price ? new Prisma.Decimal(body.price) : null,
        inventory: body.inventory ?? 0,
        sku: body.sku || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...variant,
        price: variant.price?.toString() ?? null,
      },
      message: "Variante creada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al crear variante:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El SKU ya está en uso" },
        { status: 400 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "El producto no existe" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al crear variante" },
      { status: 500 },
    );
  }
}

// ----------------------
// PUT: Actualizar variante (solo ADMIN)
// ----------------------
async function updateVariant(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("id");

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: "ID de la variante requerido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Verificar que la variante exista
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    // Actualizar variante
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: body.name,
        value: body.value,
        price: body.price !== undefined 
          ? (body.price ? new Prisma.Decimal(body.price) : null)
          : undefined,
        inventory: body.inventory,
        sku: body.sku,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...variant,
        price: variant.price?.toString() ?? null,
      },
      message: "Variante actualizada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar variante:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El SKU ya está en uso" },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al actualizar variante" },
      { status: 500 },
    );
  }
}

// ----------------------
// DELETE: Eliminar variante (solo ADMIN)
// ----------------------
async function deleteVariant(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("id");

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: "ID de la variante requerido" },
        { status: 400 },
      );
    }

    // Verificar que la variante exista
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    // Eliminar variante
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({
      success: true,
      message: "Variante eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar variante:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al eliminar variante" },
      { status: 500 },
    );
  }
}

// ----------------------
// Exportar métodos protegidos por rol
// ----------------------
export const POST = withRoleAuth(createVariant, "ADMIN");
export const PUT = withRoleAuth(updateVariant, "ADMIN");
export const DELETE = withRoleAuth(deleteVariant, "ADMIN");