import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-utils";

// Helper para verificar autenticación
async function verifyAuth(requiredRole: "USER" | "ADMIN" = "USER") {
  const authResult = await checkAuth(requiredRole);
  console.log("verifyAuth - Resultado:", {
    authorized: authResult.authorized,
    error: authResult.error,
    user: authResult.user
      ? {
          id: authResult.user.id,
          email: authResult.user.email,
          role: authResult.user.role,
        }
      : null,
  });

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

// GET: Obtener carrito del usuario (requiere autenticación)
async function getCart(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;

    // Buscar o crear carrito para el usuario
    let cart: any = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                inventory: true,
                brand: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                value: true,
                price: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    // Si no existe, crear uno vacío
    if (!cart) {
      console.log("GET: Creando carrito para userId:", userId);
      // Verificar que el usuario existe antes de crear el carrito
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        console.error("GET: Usuario no encontrado en DB:", userId);
        return NextResponse.json(
          {
            success: false,
            error: "Usuario no encontrado",
            message: "El usuario no existe en la base de datos",
          },
          { status: 404 },
        );
      }

      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  images: true,
                  inventory: true,
                  brand: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                  price: true,
                  inventory: true,
                },
              },
            },
          },
        },
      });
      console.log("GET: Carrito creado:", cart.id);
    }

    // Calcular totales
    let total = 0;
    let itemCount = 0;

    const items = (cart.items || []).map((item: any) => {
      const productPrice = Number(item.product.price);
      const variantPrice = item.variant?.price ? Number(item.variant.price) : 0;
      const itemPrice = variantPrice > 0 ? variantPrice : productPrice;
      const itemTotal = itemPrice * item.quantity;

      total += itemTotal;
      itemCount += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images[0] || null,
        productPrice: productPrice,
        variantId: item.variantId,
        variantName: item.variant?.name,
        variantValue: item.variant?.value,
        variantPrice: variantPrice,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal,
        inventory: item.product.inventory,
        brand: item.product.brand,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        userId: cart.userId,
        items,
        total,
        itemCount,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
      message: items.length > 0 ? "Carrito obtenido" : "Carrito vacío",
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener carrito",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}

// POST: Agregar item al carrito
async function addToCart(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const body = await req.json();
    console.log("API /api/cart POST - Body recibido:", body);

    // Validar datos requeridos
    if (!body.productId || !body.quantity) {
      return NextResponse.json(
        { success: false, error: "productId y quantity son requeridos" },
        { status: 400 },
      );
    }

    // Validar cantidad
    if (body.quantity < 1) {
      return NextResponse.json(
        { success: false, error: "La cantidad debe ser al menos 1" },
        { status: 400 },
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Verificar inventario
    if (product.inventory < body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventario insuficiente",
          available: product.inventory,
        },
        { status: 400 },
      );
    }

    // Verificar variante si se especifica
    let variant = null;
    if (body.variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: body.variantId, productId: body.productId },
      });

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            error: "Variante no encontrada para este producto",
          },
          { status: 404 },
        );
      }

      // Verificar inventario de la variante
      if (variant.inventory < body.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: "Inventario insuficiente para esta variante",
            available: variant.inventory,
          },
          { status: 400 },
        );
      }
    }

    // Buscar o crear carrito para el usuario autenticado
    let cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      console.log("Creando carrito para userId:", userId);
      // Verificar que el usuario existe antes de crear el carrito
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        console.error("POST: Usuario no encontrado en DB:", userId);
        return NextResponse.json(
          {
            success: false,
            error: "Usuario no encontrado",
            message: "El usuario no existe en la base de datos",
          },
          { status: 404 },
        );
      }

      cart = await prisma.cart.create({
        data: { userId },
      });
      console.log("Carrito creado:", cart.id);
    }

    // Buscar item existente en el carrito
    // Usar findFirst porque variantId puede ser null
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: body.productId,
        variantId: body.variantId || null,
      },
    });

    let cartItem;
    if (existingItem) {
      // Actualizar cantidad
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + body.quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              inventory: true,
              brand: true,
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
      });
    } else {
      // Crear nuevo item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          variantId: body.variantId || null,
          quantity: body.quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              inventory: true,
              brand: true,
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
      });
    }

    // Calcular precio del item
    const productPrice = Number(cartItem.product.price);
    const variantPrice = cartItem.variant?.price
      ? Number(cartItem.variant.price)
      : 0;
    const itemPrice = variantPrice > 0 ? variantPrice : productPrice;
    const itemTotal = itemPrice * cartItem.quantity;

    return NextResponse.json({
      success: true,
      data: {
        id: cartItem.id,
        productId: cartItem.productId,
        productName: cartItem.product.name,
        productSlug: cartItem.product.slug,
        productImage: cartItem.product.images[0] || null,
        productPrice: productPrice,
        variantId: cartItem.variantId,
        variantName: cartItem.variant?.name,
        variantValue: cartItem.variant?.value,
        variantPrice: variantPrice,
        quantity: cartItem.quantity,
        price: itemPrice,
        total: itemTotal,
        cartId: cart.id,
      },
      message: "Producto agregado al carrito",
    });
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error al agregar al carrito",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Error desconocido"
            : undefined,
      },
      { status: 500 },
    );
  }
}

// PUT: Actualizar cantidad en carrito (requiere autenticación)
async function updateCartItem(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const body = await req.json();

    if (!body.itemId || !body.quantity) {
      return NextResponse.json(
        { success: false, error: "itemId y quantity son requeridos" },
        { status: 400 },
      );
    }

    // Validar cantidad
    if (body.quantity < 1) {
      return NextResponse.json(
        { success: false, error: "La cantidad debe ser al menos 1" },
        { status: 400 },
      );
    }

    // Buscar el item del carrito
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: body.itemId,
        cart: { userId }, // Asegurar que pertenece al usuario
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inventory: true,
            brand: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            inventory: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Item del carrito no encontrado" },
        { status: 404 },
      );
    }

    // Verificar inventario
    const inventory = cartItem.variant?.inventory ?? cartItem.product.inventory;
    if (inventory < body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Inventario insuficiente",
          available: inventory,
        },
        { status: 400 },
      );
    }

    // Actualizar cantidad
    const updatedItem = await prisma.cartItem.update({
      where: { id: body.itemId },
      data: { quantity: body.quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            inventory: true,
            brand: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            inventory: true,
          },
        },
      },
    });

    // Calcular precio del item
    const productPrice = Number(updatedItem.product.price);
    const variantPrice = updatedItem.variant?.price
      ? Number(updatedItem.variant.price)
      : 0;
    const itemPrice = variantPrice > 0 ? variantPrice : productPrice;
    const itemTotal = itemPrice * updatedItem.quantity;

    return NextResponse.json({
      success: true,
      data: {
        id: updatedItem.id,
        productId: updatedItem.productId,
        productName: updatedItem.product.name,
        productSlug: updatedItem.product.slug,
        productImage: updatedItem.product.images[0] || null,
        productPrice: productPrice,
        variantId: updatedItem.variantId,
        variantName: updatedItem.variant?.name,
        variantValue: updatedItem.variant?.value,
        variantPrice: variantPrice,
        quantity: updatedItem.quantity,
        price: itemPrice,
        total: itemTotal,
      },
      message: "Carrito actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar carrito" },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar item del carrito (requiere autenticación)
async function deleteCartItem(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId es requerido" },
        { status: 400 },
      );
    }

    // Verificar que el item pertenece al usuario
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Item del carrito no encontrado" },
        { status: 404 },
      );
    }

    // Eliminar item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item eliminado del carrito",
    });
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar del carrito" },
      { status: 500 },
    );
  }
}

// Exportar handlers
export { getCart as GET };
export { addToCart as POST };
export { updateCartItem as PUT };
export { deleteCartItem as DELETE };
