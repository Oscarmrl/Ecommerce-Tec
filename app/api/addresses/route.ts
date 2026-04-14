import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-utils";

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

// GET: Obtener todas las direcciones del usuario autenticado
async function getAddresses(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;

    // Obtener direcciones
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: addresses,
      message: `Direcciones obtenidas (${addresses.length})`,
    });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener direcciones",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// POST: Crear una nueva dirección
async function createAddress(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const body = await req.json();
    
    console.log("API /api/addresses POST - Body recibido:", body);

    // Validar campos requeridos
    const requiredFields = ["street", "city", "state", "postalCode", "country"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `El campo ${field} es requerido` },
          { status: 400 },
        );
      }
    }

    // Si se marca como default, quitar default de otras direcciones
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Crear dirección
    const address = await prisma.address.create({
      data: {
        userId,
        street: body.street,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
        phone: body.phone || null,
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: address,
      message: "Dirección creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear dirección:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear dirección",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// PUT: Actualizar una dirección existente
async function updateAddress(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    
    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "El parámetro id es requerido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Dirección no encontrada" },
        { status: 404 },
      );
    }

    // Si se marca como default, quitar default de otras direcciones
    if (body.isDefault === true) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    // Actualizar dirección
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        street: body.street,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
        phone: body.phone,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAddress,
      message: "Dirección actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar dirección",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar una dirección
async function deleteAddress(req: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth("USER");
    if (!auth.authorized) return auth.response;

    const userId = auth.user!.id;
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    
    if (!addressId) {
      return NextResponse.json(
        { success: false, error: "El parámetro id es requerido" },
        { status: 400 },
      );
    }

    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Dirección no encontrada" },
        { status: 404 },
      );
    }

    // No permitir eliminar la dirección si es la única
    const addressCount = await prisma.address.count({ where: { userId } });
    if (addressCount <= 1) {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar la única dirección" },
        { status: 400 },
      );
    }

    // Eliminar dirección
    await prisma.address.delete({
      where: { id: addressId },
    });

    // Si la eliminada era default, establecer otra como default
    if (existingAddress.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId },
      });
      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Dirección eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar dirección",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

// Exportar handlers
export { getAddresses as GET };
export { createAddress as POST };
export { updateAddress as PUT };
export { deleteAddress as DELETE };