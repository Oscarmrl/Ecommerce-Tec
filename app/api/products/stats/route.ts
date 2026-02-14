// app/api/products/stats/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";

// ----------------------
// GET: Obtener estadísticas de productos (solo ADMIN)
// ----------------------
async function getProductStats(req: NextRequest) {
  try {
    const [totalProducts, totalCategories, lowStockProducts, outOfStockProducts] = await Promise.all([
      // Total de productos
      prisma.product.count(),
      
      // Total de categorías
      prisma.category.count(),
      
      // Productos con bajo stock (< 10 unidades)
      prisma.product.count({
        where: {
          inventory: {
            gt: 0,
            lt: 10,
          },
        },
      }),
      
      // Productos agotados
      prisma.product.count({
        where: {
          inventory: 0,
        },
      }),
    ]);

    // Productos por categoría
    const productsByCategory = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Marcas más populares
    const popularBrands = await prisma.product.groupBy({
      by: ["brand"],
      where: {
        brand: {
          not: null,
        },
      },
      _count: {
        brand: true,
      },
      orderBy: {
        _count: {
          brand: "desc",
        },
      },
      take: 10,
    });

    // Productos destacados
    const featuredProducts = await prisma.product.count({
      where: {
        featured: true,
      },
    });

    // Valor total del inventario
    const inventoryValue = await prisma.product.aggregate({
      _sum: {
        price: true,
      },
      where: {
        inventory: {
          gt: 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          products: totalProducts,
          categories: totalCategories,
          featured: featuredProducts,
        },
        inventory: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          totalValue: inventoryValue._sum.price?.toString() || "0",
        },
        distribution: {
          byCategory: productsByCategory.map(category => ({
            id: category.id,
            name: category.name,
            count: category._count.products,
          })),
          byBrand: popularBrands.map(brand => ({
            brand: brand.brand,
            count: brand._count.brand,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas" },
      { status: 500 },
    );
  }
}

export const GET = withRoleAuth(getProductStats, "ADMIN");