import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";

// GET: Obtener todas las órdenes (solo ADMIN)
async function getOrders(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parámetros de paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;
    
    // Filtros
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const customerEmail = searchParams.get("customerEmail");
    const orderNumber = searchParams.get("orderNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Construir filtro WHERE
    const where: Prisma.OrderWhereInput = {};
    
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }
    
    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { shippingAddress: { street: { contains: search, mode: "insensitive" } } },
        { shippingAddress: { city: { contains: search, mode: "insensitive" } } },
      ];
    }
    
    if (customerEmail) {
      where.user = { email: { contains: customerEmail, mode: "insensitive" } };
    }
    
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber, mode: "insensitive" };
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    // Ordenamiento
    const orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    if (sortBy === "total") {
      orderBy.total = sortOrder as "asc" | "desc";
    } else if (sortBy === "updatedAt") {
      orderBy.updatedAt = sortOrder as "asc" | "desc";
    } else if (sortBy === "status") {
      orderBy.status = sortOrder as "asc" | "desc";
    }
    
    // Query paralela: órdenes y total
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  brand: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    // Formatear respuesta
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total.toString(),
      user: order.user,
      itemsCount: order.items.length,
      items: order.items.map(item => ({
        id: item.id,
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price.toString(),
      })),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
      message: `Órdenes obtenidas (${orders.length})`,
    });
  } catch (error) {
    console.error("Error en API admin/orders GET:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener órdenes",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// PATCH: Actualizar estado de orden (solo ADMIN)
async function updateOrderStatus(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "ID de orden requerido" },
        { status: 400 },
      );
    }
    
    const body = await req.json();
    const { status, paymentStatus, notes } = body;
    
    if (!status && !paymentStatus && !notes) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un campo para actualizar (status, paymentStatus, notes)" },
        { status: 400 },
      );
    }
    
    // Verificar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 },
      );
    }
    
    // Preparar datos de actualización
    const updateData: any = {};
    if (status && Object.values(OrderStatus).includes(status)) {
      updateData.status = status;
    }
    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus;
    }
    if (notes !== undefined) {
      updateData.adminNotes = notes;
    }
    
    // Actualizar orden
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedOrder,
        total: updatedOrder.total.toString(),
      },
      message: "Orden actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en API admin/orders PATCH:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar orden",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// Exportar handlers protegidos por rol ADMIN
export const GET = withRoleAuth(getOrders, "ADMIN");
export const PATCH = withRoleAuth(updateOrderStatus, "ADMIN");