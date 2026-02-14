import { prisma } from "./prisma";

/**
 * Verifica si hay suficiente inventario para un producto
 */
export async function checkProductInventory(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<{
  available: boolean;
  currentInventory: number;
  message?: string;
}> {
  try {
    if (variantId) {
      // Verificar inventario de variante
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { inventory: true, productId: true, value: true, name: true },
      });

      if (!variant) {
        return {
          available: false,
          currentInventory: 0,
          message: "Variante no encontrada",
        };
      }

      if (variant.inventory < quantity) {
        return {
          available: false,
          currentInventory: variant.inventory,
          message: `Solo quedan ${variant.inventory} unidades de la variante "${variant.name}: ${variant.value}"`,
        };
      }

      return {
        available: true,
        currentInventory: variant.inventory,
      };
    } else {
      // Verificar inventario del producto principal
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { inventory: true, name: true },
      });

      if (!product) {
        return {
          available: false,
          currentInventory: 0,
          message: "Producto no encontrado",
        };
      }

      if (product.inventory < quantity) {
        return {
          available: false,
          currentInventory: product.inventory,
          message: `Solo quedan ${product.inventory} unidades de "${product.name}"`,
        };
      }

      return {
        available: true,
        currentInventory: product.inventory,
      };
    }
  } catch (error) {
    console.error("Error al verificar inventario:", error);
    return {
      available: false,
      currentInventory: 0,
      message: "Error al verificar inventario",
    };
  }
}

/**
 * Reserva inventario para un producto/variante
 */
export async function reserveInventory(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    if (variantId) {
      // Reservar inventario de variante
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { inventory: true },
      });

      if (!variant || variant.inventory < quantity) {
        return {
          success: false,
          message: "Inventario insuficiente para la variante",
        };
      }

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { inventory: { decrement: quantity } },
      });

      // También actualizar el inventario del producto principal
      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { decrement: quantity } },
      });
    } else {
      // Reservar inventario del producto principal
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { inventory: true },
      });

      if (!product || product.inventory < quantity) {
        return {
          success: false,
          message: "Inventario insuficiente",
        };
      }

      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { decrement: quantity } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error al reservar inventario:", error);
    return {
      success: false,
      message: "Error al reservar inventario",
    };
  }
}

/**
 * Libera inventario previamente reservado
 */
export async function releaseInventory(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    if (variantId) {
      // Liberar inventario de variante
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { inventory: { increment: quantity } },
      });

      // También actualizar el inventario del producto principal
      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { increment: quantity } },
      });
    } else {
      // Liberar inventario del producto principal
      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { increment: quantity } },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error al liberar inventario:", error);
    return {
      success: false,
      message: "Error al liberar inventario",
    };
  }
}

/**
 * Obtiene el inventario total de un producto (incluyendo variantes)
 */
export async function getTotalProductInventory(productId: string): Promise<number> {
  try {
    const [product, variants] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        select: { inventory: true },
      }),
      prisma.productVariant.findMany({
        where: { productId },
        select: { inventory: true },
      }),
    ]);

    if (!product) return 0;

    const variantsInventory = variants.reduce((sum, variant) => sum + variant.inventory, 0);
    return product.inventory + variantsInventory;
  } catch (error) {
    console.error("Error al obtener inventario total:", error);
    return 0;
  }
}

/**
 * Verifica si un producto está disponible (tiene inventario)
 */
export async function isProductAvailable(productId: string): Promise<boolean> {
  try {
    const totalInventory = await getTotalProductInventory(productId);
    return totalInventory > 0;
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    return false;
  }
}