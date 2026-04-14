import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-utils";
import { OrderStatus } from "@prisma/client";

// Helper para verificar autenticación
async function verifyAuth(requiredRole: "USER" | "ADMIN" = "USER") {
  const authResult = await checkAuth(requiredRole);
  
  if (!authResult.authorized) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: authResult.error,
          message: `Se requiere rol ${requiredRole} para acceder a este recurso`,
        },
        { status: 403 },
      ),
    };
  }

  return {
    authorized: true,
    user: authResult.user,
    session: authResult.session,
  };
}

// GET: Obtener detalles de una orden específica
async function getOrder(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const orderId = params.id;

    // Obtener orden
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // Asegurar que la orden pertenece al usuario
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                brand: true,
                price: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                value: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    // Calcular subtotal, impuestos, etc. (simplificado)
    const subtotal = Number(order.total);
    const shipping = 0; // Podría venir de la orden en el futuro
    const tax = 0;
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        total,
        subtotal,
        shipping,
        tax,
      },
      message: "Orden obtenida",
    });
  } catch (error) {
    console.error("Error al obtener orden:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener orden",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// PUT: Actualizar estado de la orden (solo ADMIN o el usuario mismo para cancelar)
async function updateOrder(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const userRole = auth.user!.role;
    const orderId = params.id;
    const body = await req.json();

    // Verificar que la orden existe y pertenece al usuario
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 },
      );
    }

    // Solo ADMIN puede actualizar estado, usuario solo puede cancelar (si está pendiente)
    const allowedUpdates: any = {};
    if (userRole === "ADMIN") {
      if (body.status && Object.values(OrderStatus).includes(body.status)) {
        allowedUpdates.status = body.status;
      }
      if (body.paymentStatus) {
        allowedUpdates.paymentStatus = body.paymentStatus;
      }
    } else if (userRole === "USER") {
      // Usuario solo puede cancelar órdenes pendientes
      if (body.status === OrderStatus.CANCELLED && order.status === OrderStatus.PENDING) {
        allowedUpdates.status = OrderStatus.CANCELLED;
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No se permiten las actualizaciones solicitadas" },
        { status: 400 },
      );
    }

    // Actualizar orden
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: allowedUpdates,
      include: {
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
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Orden actualizada",
    });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
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

// Exportar handlers
export { getOrder as GET };
export { updateOrder as PUT };