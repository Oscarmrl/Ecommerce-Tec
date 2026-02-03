import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  // Obtener productos de ejemplo (en producción usarías filtros reales)
  const products = await prisma.product.findMany({
    take: 12,
    include: {
      category: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      parentId: null, // Solo categorías principales
    },
    include: {
      children: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Computadoras y Laptops
        </h1>
        <p className="text-muted-foreground">
          Encuentra la computadora perfecta para tus necesidades
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros */}
        <div className="lg:w-1/4">
          <ProductFilters categories={categories} />
        </div>

        {/* Grid de productos */}
        <div className="lg:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-muted-foreground">
              Mostrando {products.length} productos
            </p>
            <div className="flex items-center gap-4">
              <select className="bg-background border border-input rounded-lg px-3 py-2 text-sm">
                <option>Ordenar por: Más recientes</option>
                <option>Precio: Menor a mayor</option>
                <option>Precio: Mayor a menor</option>
                <option>Mejor calificados</option>
              </select>
            </div>
          </div>

          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}