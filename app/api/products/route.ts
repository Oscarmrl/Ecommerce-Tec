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

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Prisma.ProductWhereInput = {};

    if (category) where.categoryId = category;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (featuredParam !== null) {
      where.featured = featuredParam === "true";
    }

    // Query paralela
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
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
// Exportar POST protegido por rol
// ----------------------
export const POST = withRoleAuth(createProduct, "ADMIN");
