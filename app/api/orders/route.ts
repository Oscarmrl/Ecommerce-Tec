import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-utils";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";

interface OrderItemData {
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
}

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

// Función para generar número de orden único
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `ORD-${timestamp}${random}`;
}

// GET: Obtener todas las órdenes del usuario autenticado
async function getOrders(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const skip = (page - 1) * limit;

    // Construir filtro
    const where: Prisma.OrderWhereInput = { userId };
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    // Obtener órdenes
    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Contar total
    const total = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      message: `Órdenes obtenidas (${orders.length})`,
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
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

// POST: Crear una nueva orden desde el carrito
async function createOrder(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const body = await req.json();
    
    console.log("API /api/orders POST - Body recibido:", body);

    // Validar datos requeridos
    if (!body.shippingAddressId || !body.paymentMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: "shippingAddressId y paymentMethod son requeridos" 
        },
        { status: 400 },
      );
    }

    // Usar misma dirección para facturación si no se especifica
    const billingAddressId = body.billingAddressId || body.shippingAddressId;

    // Obtener carrito del usuario
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                inventory: true,
              },
            },
            variant: {
              select: {
                id: true,
                price: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "El carrito está vacío" },
        { status: 400 },
      );
    }

    // Verificar inventario y calcular total
    let total = 0;
    const orderItemsData: OrderItemData[] = [];
    
    for (const item of cart.items) {
      const productPrice = Number(item.product.price);
      const variantPrice = item.variant?.price ? Number(item.variant.price) : 0;
      const itemPrice = variantPrice > 0 ? variantPrice : productPrice;
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;

      // Verificar inventario
      const inventory = item.variant?.inventory ?? item.product.inventory;
      if (inventory < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: "Inventario insuficiente",
            productId: item.product.id,
            productName: item.product.name,
            available: inventory,
            requested: item.quantity,
          },
          { status: 400 },
        );
      }

      orderItemsData.push({
        productId: item.product.id,
        variantId: item.variant?.id || null,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // Crear la orden dentro de una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la orden
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          total,
          status: OrderStatus.PENDING,
          shippingAddressId: body.shippingAddressId,
          billingAddressId,
          paymentMethod: body.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      // 2. Crear los items de la orden
      for (const itemData of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: itemData.productId,
            variantId: itemData.variantId,
            quantity: itemData.quantity,
            price: itemData.price,
          },
        });

        // 3. Actualizar inventario
        if (itemData.variantId) {
          await tx.productVariant.update({
            where: { id: itemData.variantId },
            data: {
              inventory: { decrement: itemData.quantity },
            },
          });
        } else {
          await tx.product.update({
            where: { id: itemData.productId },
            data: {
              inventory: { decrement: itemData.quantity },
            },
          });
        }
      }

      // 4. Vaciar el carrito
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 5. Obtener la orden con relaciones para respuesta
      const orderWithDetails = await tx.order.findUnique({
        where: { id: order.id },
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

      return orderWithDetails;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Orden creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear orden:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear orden",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// Exportar handlers
export { getOrders as GET };
export { createOrder as POST };