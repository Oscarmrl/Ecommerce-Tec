import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  let products: any[] = [];
  let categories: any[] = [];
  
  try {
    // Obtener productos de ejemplo (en producción usarías filtros reales)
    products = await prisma.product.findMany({
      take: 12,
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    categories = await prisma.category.findMany({
      where: {
        parentId: null, // Solo categorías principales
      },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error al cargar productos o categorías:", error);
    // Datos de ejemplo para desarrollo
    products = [
      {
        id: "1",
        name: "MacBook Pro 16\"",
        slug: "macbook-pro-16",
        description: "Potente laptop para profesionales",
        price: 2499,
        comparePrice: 2799,
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"],
        rating: 4.8,
        featured: true,
        inventory: 10,
        brand: "Apple",
        processor: "Apple M3 Pro",
        ram: "16GB",
        category: { name: "Laptops" },
        variants: []
      },
      {
        id: "2",
        name: "Dell XPS 15",
        slug: "dell-xps-15",
        description: "Laptop premium para creativos",
        price: 1899,
        comparePrice: 2099,
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"],
        rating: 4.6,
        featured: true,
        inventory: 15,
        brand: "Dell",
        processor: "Intel Core i7",
        ram: "16GB",
        category: { name: "Laptops" },
        variants: []
      },
      {
        id: "3",
        name: "HP Spectre x360",
        slug: "hp-spectre-x360",
        description: "Laptop convertible 2 en 1",
        price: 1499,
        comparePrice: 1699,
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"],
        rating: 4.5,
        featured: false,
        inventory: 8,
        brand: "HP",
        processor: "Intel Core i5",
        ram: "8GB",
        category: { name: "Laptops" },
        variants: []
      }
    ];
    
    categories = [
      {
        id: "1",
        name: "Laptops",
        slug: "laptops",
        children: [
          { id: "2", name: "Gaming", slug: "gaming-laptops", children: [] },
          { id: "3", name: "Ultrabooks", slug: "ultrabooks", children: [] }
        ]
      },
      {
        id: "4",
        name: "Desktop",
        slug: "desktop",
        children: [
          { id: "5", name: "Gaming PC", slug: "gaming-pc", children: [] },
          { id: "6", name: "Workstation", slug: "workstation", children: [] }
        ]
      }
    ];
  }

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