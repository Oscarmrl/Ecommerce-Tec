// app/api/products/inventory/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkProductInventory } from "@/lib/inventory-utils";

// ----------------------
// GET: Obtener estado del inventario de un producto
// ----------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ID del producto requerido" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        inventory: true,
        variants: {
          select: {
            id: true,
            name: true,
            value: true,
            inventory: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Calcular inventario total (producto + variantes)
    const variantsInventory = product.variants.reduce(
      (sum, variant) => sum + variant.inventory,
      0
    );
    const totalInventory = product.inventory + variantsInventory;

    return NextResponse.json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        mainInventory: product.inventory,
        variants: product.variants,
        totalInventory,
        available: totalInventory > 0,
        lowStock: totalInventory > 0 && totalInventory <= 10,
        outOfStock: totalInventory === 0,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener inventario" },
      { status: 500 },
    );
  }
}

// ----------------------
// POST: Verificar disponibilidad para una cantidad específica
// ----------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, variantId } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: "Product ID y cantidad requeridos" },
        { status: 400 },
      );
    }

    const inventoryCheck = await checkProductInventory(productId, quantity, variantId);

    return NextResponse.json({
      success: true,
      data: {
        ...inventoryCheck,
        requestedQuantity: quantity,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error al verificar inventario:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar inventario" },
      { status: 500 },
    );
  }
}