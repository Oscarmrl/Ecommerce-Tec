// app/api/products/variants/inventory/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkProductInventory } from "@/lib/inventory-utils";

// ----------------------
// GET: Obtener estado del inventario de una variante
// ----------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("id");

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: "ID de la variante requerido" },
        { status: 400 },
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            inventory: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        variantId: variant.id,
        variantName: variant.name,
        variantValue: variant.value,
        inventory: variant.inventory,
        productId: variant.product.id,
        productName: variant.product.name,
        productInventory: variant.product.inventory,
        available: variant.inventory > 0,
        lowStock: variant.inventory > 0 && variant.inventory <= 5,
        outOfStock: variant.inventory === 0,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al obtener inventario de variante:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener inventario" },
      { status: 500 },
    );
  }
}

// ----------------------
// POST: Verificar disponibilidad de variante para una cantidad específica
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, quantity } = body;

    if (!variantId || !quantity) {
      return NextResponse.json(
        { success: false, error: "Variant ID y cantidad requeridos" },
        { status: 400 },
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 },
      );
    }

    const inventoryCheck = await checkProductInventory(
      variant.product.id,
      quantity,
      variantId
    );

    return NextResponse.json({
      success: true,
      data: {
        ...inventoryCheck,
        variantId,
        variantName: variant.name,
        variantValue: variant.value,
        requestedQuantity: quantity,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al verificar inventario de variante:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar inventario" },
      { status: 500 },
    );
  }
}