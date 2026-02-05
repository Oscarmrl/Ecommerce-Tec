import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-utils";

// GET: Obtener estadísticas del dashboard (solo ADMIN)
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación y rol
    const authResult = await checkAuth("ADMIN");
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error,
          message: "Se requiere rol ADMIN para acceder a estas estadísticas"
        },
        { status: 403 }
      );
    }
    
    // Obtener estadísticas
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total usuarios
      prisma.user.count(),
      
      // Total productos
      prisma.product.count(),
      
      // Total órdenes
      prisma.order.count(),
      
      // Revenue total (suma de totales de órdenes)
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      
      // Órdenes recientes (últimas 5)
      prisma.order.findMany({
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      
      // Productos con bajo inventario (< 10 unidades)
      prisma.product.findMany({
        where: {
          inventory: {
            lt: 10,
          },
        },
        take: 10,
        select: {
          id: true,
          name: true,
          inventory: true,
          price: true,
        },
        orderBy: {
          inventory: "asc",
        },
      }),
    ]);
    
    // Estadísticas por categoría
    const categoriesWithStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
    
    // Usuarios nuevos (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    
    // Ventas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });
    
    // Formatear respuesta
    const stats = {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum?.total || 0,
        newUsersLast30Days: newUsers,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customer: order.user ? {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
        } : null,
        createdAt: order.createdAt,
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        inventory: product.inventory,
        price: product.price,
      })),
      categories: categoriesWithStats.map(category => ({
        id: category.id,
        name: category.name,
        productCount: category._count.products,
        latestProduct: category.products[0] || null,
      })),
      monthlySales: monthlySales.map(sale => ({
        month: sale.createdAt.toISOString().slice(0, 7), // YYYY-MM
        revenue: sale._sum?.total || 0,
        orderCount: sale._count || 0,
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
      user: {
        id: authResult.user?.id,
        email: authResult.user?.email,
        name: authResult.user?.name,
        role: authResult.user?.role,
      },
    });
    
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}