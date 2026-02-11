import ProductCard from "./product-card";
import { Product } from "@prisma/client";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No se encontraron productos
        </h3>
        <p className="text-muted-foreground">
          Intenta con otros filtros o categorías
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
            images: product.images,
            rating: product.rating,
            featured: product.featured,
            inventory: product.inventory,
            brand: product.brand,
            processor: product.processor,
            ram: product.ram,
          }}
        />
      ))}
    </div>
  );
}