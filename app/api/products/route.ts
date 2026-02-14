// app/api/products/route.ts
export const runtime = "nodejs"; // ⚡ Forzar Node runtime para Prisma

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleAuth } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

// ----------------------
// GET: Obtener productos (público)
// ----------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10")),
    );

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featuredParam = searchParams.get("featured");
    const brand = searchParams.get("brand");
    const processor = searchParams.get("processor");
    const ram = searchParams.get("ram");
    const storage = searchParams.get("storage");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStockParam = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Prisma.ProductWhereInput = {};

    if (category) where.categoryId = category;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { processor: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (featuredParam !== null) {
      where.featured = featuredParam === "true";
    }

    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (processor) {
      where.processor = { contains: processor, mode: "insensitive" };
    }

    if (ram) {
      where.ram = { contains: ram, mode: "insensitive" };
    }

    if (storage) {
      where.storage = { contains: storage, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (inStockParam === "true") {
      where.inventory = { gt: 0 };
    }

    // Ordenamiento
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "rating") {
      orderBy.rating = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Query paralela
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { take: 1 },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Formatear para el frontend (Decimal -> string)
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() ?? null,
      images: product.images,
      category: product.category,
      featured: product.featured,
      inventory: product.inventory,
      rating: product.rating,
      tags: product.tags,
      brand: product.brand,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      graphics: product.graphics,
      variant: product.variants[0] || null,
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener productos" },
      { status: 500 },
    );
  }
}

// ----------------------
// POST: Crear producto (solo ADMIN)
// ----------------------
async function createProduct(req: NextRequest) {
  try {
    const body = await req.json();

    // Validaciones mínimas
    const requiredFields = ["name", "slug", "price", "categoryId"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Campo requerido: ${field}` },
          { status: 400 },
        );
      }
    }

    // Decimal correcto (💰)
    const price = new Prisma.Decimal(body.price);
    const comparePrice = body.comparePrice
      ? new Prisma.Decimal(body.comparePrice)
      : null;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug.toLowerCase().trim(),
        description: body.description ?? null,
        shortDescription: body.shortDescription ?? null,
        price,
        comparePrice,
        images: Array.isArray(body.images) ? body.images : [],
        categoryId: body.categoryId,
        featured: body.featured ?? false,
        inventory: body.inventory ?? 0,
        tags: Array.isArray(body.tags) ? body.tags : [],
        brand: body.brand ?? null,
        processor: body.processor ?? null,
        ram: body.ram ?? null,
        storage: body.storage ?? null,
        graphics: body.graphics ?? null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() ?? null,
      },
      message: "Producto creado exitosamente",
    });
  } catch (error: any) {
    console.error("Error al crear producto:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El slug ya está en uso" },
        { status: 400 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "La categoría no existe" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al crear producto" },
      { status: 500 },
    );
  }
}

// ----------------------
// PUT: Actualizar producto completo (solo ADMIN)
// ----------------------
async function updateProduct(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ID del producto requerido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Validar que el producto exista
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Preparar datos para actualización
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug.toLowerCase().trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.price !== undefined) updateData.price = new Prisma.Decimal(body.price);
    if (body.comparePrice !== undefined) {
      updateData.comparePrice = body.comparePrice 
        ? new Prisma.Decimal(body.comparePrice)
        : null;
    }
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.inventory !== undefined) updateData.inventory = body.inventory;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.processor !== undefined) updateData.processor = body.processor;
    if (body.ram !== undefined) updateData.ram = body.ram;
    if (body.storage !== undefined) updateData.storage = body.storage;
    if (body.graphics !== undefined) updateData.graphics = body.graphics;
    if (body.display !== undefined) updateData.display = body.display;
    if (body.os !== undefined) updateData.os = body.os;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.battery !== undefined) updateData.battery = body.battery;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() ?? null,
      },
      message: "Producto actualizado exitosamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El slug ya está en uso" },
        { status: 400 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "La categoría no existe" },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al actualizar producto" },
      { status: 500 },
    );
  }
}

// ----------------------
// PATCH: Actualización parcial del producto (solo ADMIN)
// ----------------------
async function patchProduct(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ID del producto requerido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Validar que el producto exista
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar solo campos específicos
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        ...(body.price && { price: new Prisma.Decimal(body.price) }),
        ...(body.comparePrice && { 
          comparePrice: new Prisma.Decimal(body.comparePrice) 
        }),
        ...(body.slug && { slug: body.slug.toLowerCase().trim() }),
        ...(body.images && { images: Array.isArray(body.images) ? body.images : [] }),
        ...(body.tags && { tags: Array.isArray(body.tags) ? body.tags : [] }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() ?? null,
      },
      message: "Producto actualizado exitosamente",
    });
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "El slug ya está en uso" },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al actualizar producto" },
      { status: 500 },
    );
  }
}

// ----------------------
// DELETE: Eliminar producto (solo ADMIN)
// ----------------------
async function deleteProduct(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ID del producto requerido" },
        { status: 400 },
      );
    }

    // Verificar que el producto exista
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Eliminar producto (las variantes se eliminan en cascada)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error al eliminar producto" },
      { status: 500 },
    );
  }
}

// ----------------------
// Exportar métodos protegidos por rol
// ----------------------
export const POST = withRoleAuth(createProduct, "ADMIN");
export const PUT = withRoleAuth(updateProduct, "ADMIN");
export const PATCH = withRoleAuth(patchProduct, "ADMIN");
export const DELETE = withRoleAuth(deleteProduct, "ADMIN");
