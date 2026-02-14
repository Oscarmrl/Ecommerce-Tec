import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Truck, Shield, RotateCcw } from "lucide-react";
import ProductActions from "@/components/products/product-actions";

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = params;

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
      },
    });
  } catch (error) {
    console.error("Error al cargar producto:", error);
    // Datos de ejemplo para desarrollo
    product = {
      id: "1",
      name: 'MacBook Pro 16"',
      slug: "macbook-pro-16",
      description:
        "Potente laptop para profesionales con chip Apple M3 Pro, pantalla Liquid Retina XDR de 16.2 pulgadas y hasta 22 horas de batería. Ideal para desarrolladores, diseñadores y creadores de contenido.",
      price: 2499,
      comparePrice: 2799,
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&auto=format&fit=crop",
      ],
      rating: 4.8,
      featured: true,
      inventory: 10,
      brand: "Apple",
      processor: "Apple M3 Pro (12 núcleos)",
      ram: "16GB",
      storage: "512GB SSD",
      display: '16.2" Liquid Retina XDR',
      graphics: "GPU de 18 núcleos",
      battery: "Hasta 22 horas",
      weight: "2.1 kg",
      os: "macOS Sonoma",
      warranty: "1 año",
      category: { name: "Laptops" },
      variants: [
        { id: "1", name: "16GB RAM / 512GB SSD", price: 2499 },
        { id: "2", name: "32GB RAM / 1TB SSD", price: 2999 },
        { id: "3", name: "64GB RAM / 2TB SSD", price: 3499 },
      ],
    };
  }

  if (!product) {
    notFound();
  }

  const comparePrice = product.comparePrice as number | null;
  const price = product.price as number;
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Inicio</span>
        <span className="mx-2">/</span>
        <span className="hover:text-foreground cursor-pointer">Productos</span>
        <span className="mx-2">/</span>
        <span className="hover:text-foreground cursor-pointer">
          {product.category?.name || "Laptops"}
        </span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                -{discount}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600">
                Destacado
              </Badge>
            )}
          </div>

          {/* Miniaturas */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 4).map((image: string, index: number) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`${product.name} - Vista ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 4.8} · 128 reseñas
              </span>
              <Badge variant="outline" className="ml-2">
                {product.brand || "Marca"}
              </Badge>
            </div>

            {/* Precio */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ${product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.comparePrice.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      Ahorras $
                      {comparePrice
                        ? (comparePrice - price).toLocaleString()
                        : 0}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Precio en USD · Impuestos incluidos
              </p>
            </div>

            {/* Descripción */}
            <p className="text-foreground mb-6">{product.description}</p>
          </div>

          {/* Variantes */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                Configuraciones disponibles
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((variant: any) => (
                  <Card
                    key={variant.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      variant.price === product.price ? "border-primary" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {variant.description || ""}
                          </p>
                        </div>
                        <p className="font-bold">
                          ${variant.price.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Especificaciones */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              Especificaciones técnicas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {product.processor && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Procesador</p>
                  <p className="font-medium">{product.processor}</p>
                </div>
              )}
              {product.ram && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Memoria RAM</p>
                  <p className="font-medium">{product.ram}</p>
                </div>
              )}
              {product.storage && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Almacenamiento
                  </p>
                  <p className="font-medium">{product.storage}</p>
                </div>
              )}
              {product.display && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pantalla</p>
                  <p className="font-medium">{product.display}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <ProductActions
            productId={product.id}
            inventory={product.inventory}
            price={Number(product.price)}
            productName={product.name}
            productImage={product.images[0] || ""}
            productSlug={product.slug}
          />

          {/* Información de envío y garantía */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Envío gratis</p>
                <p className="text-xs text-muted-foreground">En 2-3 díasssss</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Devolución gratis</p>
                <p className="text-xs text-muted-foreground">30 días</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Garantía</p>
                <p className="text-xs text-muted-foreground">
                  {"warranty" in product ? product.warranty : "1 año"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Soporte</p>
                <p className="text-xs text-muted-foreground">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección adicional */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          También te puede interesar
        </h2>
        {/* Aquí podrías agregar un carrusel de productos relacionados */}
      </div>
    </div>
  );
}
