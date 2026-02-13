import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Star,
  Truck,
  Shield,
  RefreshCw,
  Sparkles,
  ShoppingCart,
  Smartphone,
  Laptop,
  Headphones,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const PLACEHOLDER_IMAGE = "/placeholder-product.png";

function MaintenanceFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <div className="max-w-md w-full text-center rounded-xl border border-soft bg-surface-1 p-8 shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h1 className="text-2xl font-bold text-primary mb-2">
          Estamos en mantenimiento
        </h1>
        <p className="text-secondary leading-relaxed">
          Estamos actualizando el catálogo y mejorando la experiencia. Por favor
          intenta de nuevo en unos minutos.
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let featuredProducts: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    isNew: boolean;
    discount: number;
  }> = [];

  let categories: Array<{
    name: string;
    icon: any;
    count: number;
  }> = [];

  try {
    // Featured products
    const featuredProductsFromDb = await prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { category: true },
    });

    featuredProducts = featuredProductsFromDb.map((product, index) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || PLACEHOLDER_IMAGE, // ✅ PROTECCIÓN IMÁGENES
      category: product.category?.name || "Sin categoría",
      rating: product.rating || 4.5,
      isNew: index < 2, // demo visual (si luego agregas isNew real, lo cambias)
      discount: index === 0 ? 10 : index === 2 ? 15 : 0, // demo visual (si luego lo guardas real, lo cambias)
    }));

    // Categories (top level) with counts
    const categoriesFromDb = await prisma.category.findMany({
      where: { parentId: null },
      take: 4,
      include: {
        _count: { select: { products: true } },
      },
    });

    categories = categoriesFromDb.map((category, index) => ({
      name: category.name,
      icon:
        [Smartphone, Laptop, Headphones, ShoppingCart][index] || ShoppingCart,
      count: category._count.products,
    }));

    // ✅ Si tu DB está OK pero no hay data aún, decide qué mostrar:
    // Opción A (recomendada): no “inventar”, solo mostrar secciones vacías.
    // Opción B: si prefieres, podrías también mostrar MaintenanceFallback cuando no haya nada.
    //
    // Aquí dejo Opción A: la página carga, pero sin inventar datos.
  } catch (error) {
    console.error("Error loading home page data:", error);
    // ✅ Ya NO mostramos datos falsos:
    return <MaintenanceFallback />;
  }

  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En pedidos mayores a $500",
    },
    {
      icon: Shield,
      title: "Garantía",
      description: "2 años en todos los productos",
    },
    {
      icon: RefreshCw,
      title: "Devoluciones",
      description: "30 días para devoluciones",
    },
    { icon: Star, title: "Calidad", description: "Productos certificados" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-0 py-24">
        <div className="absolute inset-0 circuit-pattern" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-soft mb-8">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              TECNOLOGÍA DE VANGUARDIA
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Innovación Tecnológica
            </span>
            <br />
            <span className="text-primary">al Alcance de tu Mano</span>
          </h1>

          <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre dispositivos de última generación, diseñados para
            <span className="text-primary font-medium">
              {" "}
              maximizar tu productividad
            </span>{" "}
            y
            <span className="text-accent font-medium">
              {" "}
              elevar tu experiencia
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GradientButton
              size="lg"
              className="px-8 py-3 rounded-lg hover-lift glow-primary transition-smooth group"
            >
              <Sparkles className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
              <span className="font-semibold tracking-wide">
                Explorar Catálogo
              </span>
            </GradientButton>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 rounded-lg border-2 border-strong text-primary hover:bg-surface-1 hover:border-primary hover-lift transition-smooth"
            >
              <span className="font-semibold tracking-wide">Ver Ofertas</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-surface-0 border border-soft"
              >
                <div className="inline-flex p-3 rounded-lg bg-surface-1 border border-soft mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 relative">
        <div className="container relative mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl border border-soft bg-surface-0 p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-lg bg-surface-1 border border-soft">
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-surface-1 border border-soft text-tertiary">
                    {category.count}+
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  {category.name}
                </h3>
                <p className="text-sm text-secondary">
                  Explora productos de esta categoría
                </p>
              </div>
            ))}
          </div>

          {/* ✅ Si no hay categorías en DB, muestra un mensaje vacío */}
          {categories.length === 0 && (
            <div className="mt-10 text-center text-secondary">
              No hay categorías disponibles por el momento.
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface-2">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => {
              const discounted = product.discount > 0;
              const finalPrice = discounted
                ? Number(
                    (
                      product.price -
                      (product.price * product.discount) / 100
                    ).toFixed(2),
                  )
                : product.price;

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-soft bg-surface-0"
                >
                  <div className="relative aspect-square bg-surface-1">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-0/90 px-2 py-1 rounded-full border border-soft">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-xs font-medium text-tertiary mb-1">
                      {product.category}
                    </div>
                    <h3 className="font-semibold text-lg text-primary">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between pt-4 border-t border-soft mt-4">
                      <div>
                        {discounted ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">
                              ${finalPrice}
                            </span>
                            <span className="text-sm text-tertiary line-through">
                              ${product.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-primary">
                            ${product.price}
                          </span>
                        )}
                      </div>

                      <Button size="sm" variant="outline">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ Si no hay destacados en DB, muestra un mensaje vacío */}
          {featuredProducts.length === 0 && (
            <div className="mt-10 text-center text-secondary">
              No hay productos destacados por el momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
