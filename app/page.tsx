import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  ShoppingCart,
  Smartphone,
  Laptop,
  Headphones,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let categories: any[] = [];
  let dataStatus: "ok" | "empty" | "error" = "ok";

  // Placeholder seguro (local) para evitar 400 de next/image con dominios no permitidos
  const PLACEHOLDER_IMG = "/images/placeholder-product.png";

  try {
    // Fetch featured products from database
    const featuredProductsFromDb = await prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { category: true },
    });

    featuredProducts = featuredProductsFromDb.map((product, index) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || PLACEHOLDER_IMG,
      category: product.category?.name || "Computadoras",
      rating: product.rating || 4.5,
      isNew: index < 2, // demo
      discount: index === 0 ? 10 : index === 2 ? 15 : 0, // demo
    }));

    // Fetch categories with product counts
    const categoriesFromDb = await prisma.category.findMany({
      where: { parentId: null },
      take: 4,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    categories = categoriesFromDb.map((category, index) => ({
      name: category.name,
      icon:
        [Smartphone, Laptop, Headphones, ShoppingCart][index] || ShoppingCart,
      count: category._count.products,
    }));

    // Si no hay suficientes categorías, completa con defaults (solo estructura visual)
    if (categories.length < 4) {
      const defaultCategories = [
        { name: "Smartphones", icon: Smartphone, count: 0 },
        { name: "Laptops", icon: Laptop, count: 0 },
        { name: "Audio", icon: Headphones, count: 0 },
        { name: "Accessories", icon: ShoppingCart, count: 0 },
      ];
      for (let i = categories.length; i < 4; i++) {
        categories.push(defaultCategories[i]);
      }
    }

    // Si no hay productos destacados reales, marcamos como vacío
    if (featuredProducts.length === 0) {
      dataStatus = "empty";
    }
  } catch (error) {
    console.error("Error loading home page data:", error);

    // Mantener UI bonita pero sin mentir: sin productos, categorías “vacías”
    dataStatus = "error";
    categories = [
      { name: "Smartphones", icon: Smartphone, count: 0 },
      { name: "Laptops", icon: Laptop, count: 0 },
      { name: "Audio", icon: Headphones, count: 0 },
      { name: "Accessories", icon: ShoppingCart, count: 0 },
    ];
    featuredProducts = [];
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
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

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-tertiary">Productos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-1">4.8★</div>
              <div className="text-sm text-tertiary">Rating Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">24h</div>
              <div className="text-sm text-tertiary">Envío Express</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">2A</div>
              <div className="text-sm text-tertiary">Garantía</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Experiencia Premium
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Diseñado para quienes exigen lo mejor en tecnología y servicio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const gradientColors = [
                "from-primary/20 to-primary/5",
                "from-secondary/20 to-secondary/5",
                "from-accent/20 to-accent/5",
                "from-primary/20 to-accent/5",
              ];

              const iconColors = [
                "text-primary",
                "text-secondary",
                "text-accent",
                "text-primary",
              ];

              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-xl bg-surface-0 border border-soft hover:border-primary/30 hover-lift transition-smooth"
                >
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientColors[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div
                      className={`inline-flex p-3 rounded-lg bg-surface-1 border border-soft mb-4 ${iconColors[index]}`}
                    >
                      <feature.icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-primary group-hover:text-primary-dark transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-secondary leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-soft">
                      <div className="text-xs font-medium text-tertiary">
                        <span className="text-primary">→</span> Más información
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 relative">
        <div className="absolute inset-0 circuit-pattern opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-soft mb-4">
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium text-secondary">
                EXPLORAR CATEGORÍAS
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Tecnología por <span className="text-primary">Especialidad</span>
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Navega por nuestras categorías especializadas diseñadas para cada
              necesidad tecnológica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category: any, index: number) => {
              const gradients = [
                "from-primary/10 to-primary/5",
                "from-secondary/10 to-secondary/5",
                "from-accent/10 to-accent/5",
                "from-primary/10 to-accent/5",
              ];

              const iconColors = [
                "text-primary",
                "text-secondary",
                "text-accent",
                "text-primary",
              ];

              return (
                <div
                  key={category.name}
                  className="group relative overflow-hidden rounded-xl border border-soft bg-surface-0 hover:border-primary/40 hover-lift transition-smooth"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`p-3 rounded-lg bg-surface-1 border border-soft ${iconColors[index]}`}
                      >
                        <category.icon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-medium px-2 py-1 rounded-full bg-surface-1 border border-soft text-tertiary">
                        {category.count}+
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-primary group-hover:text-primary-dark transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm text-secondary mb-6">
                      Dispositivos y accesorios especializados para maximizar tu
                      experiencia
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-soft">
                      <span className="text-xs font-medium text-tertiary group-hover:text-primary transition-colors">
                        Explorar categoría →
                      </span>
                      <div className="h-8 w-8 rounded-full bg-surface-1 border border-soft flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <div className="h-3 w-3 border-r-2 border-b-2 border-current transform rotate-[-45deg]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-soft mb-4">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">
                  PRODUCTOS DESTACADOS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lo <span className="text-primary">Mejor</span> en Tecnología
              </h2>
              <p className="text-secondary mt-2 max-w-2xl">
                Selección curada de dispositivos premium con las mejores
                valoraciones
              </p>
            </div>
            <Button
              variant="outline"
              className="border-strong text-primary hover:bg-surface-1 hover:border-primary hover-lift transition-smooth px-6"
            >
              <span className="font-semibold">Ver Catálogo Completo</span>
              <div className="ml-2 h-4 w-4 border-r-2 border-b-2 border-current transform rotate-[-45deg]" />
            </Button>
          </div>

          {/* ✅ Cambio: si no hay productos reales, mostramos mensaje honesto */}
          {featuredProducts.length === 0 ? (
            <div className="rounded-xl border border-soft bg-surface-0 p-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <h3 className="text-lg font-semibold text-primary">
                No hay productos disponibles por ahora
              </h3>
              <p className="mt-2 text-sm text-secondary">
                Estamos actualizando el catálogo. Vuelve a intentarlo en unos
                minutos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: any, index: number) => {
                const gradients = [
                  "from-primary/20 to-primary/5",
                  "from-secondary/20 to-secondary/5",
                  "from-accent/20 to-accent/5",
                  "from-primary/20 to-accent/5",
                ];

                const accentColors = [
                  "bg-primary text-primary-foreground hover:bg-primary-dark",
                  "bg-secondary text-secondary-foreground hover:bg-secondary-dark",
                  "bg-accent text-accent-foreground hover:bg-accent-dark",
                  "bg-primary text-primary-foreground hover:bg-primary-dark",
                ];

                return (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-xl border border-soft bg-surface-0 hover:border-primary/40 hover-lift transition-smooth"
                  >
                    {/* Product Image Area */}
                    <div className="relative aspect-square bg-gradient-to-br from-surface-1 to-surface-0 overflow-hidden">
                      {/* Product Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={product.image || PLACEHOLDER_IMG}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                        />
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {product.isNew && (
                          <div className="px-2 py-1 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
                            NUEVO
                          </div>
                        )}
                        {product.discount > 0 && (
                          <div className="px-2 py-1 rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-sm">
                            -{product.discount}%
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-0/90 backdrop-blur-sm px-2 py-1 rounded-full border border-soft z-10">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs font-semibold text-primary">
                          {product.rating}
                        </span>
                      </div>

                      {/* Quick Action */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          size="sm"
                          className={`${accentColors[index]} rounded-full px-4 shadow-md hover-lift`}
                        >
                          <ShoppingCart className="w-3 h-3 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="mb-3">
                        <div className="text-xs font-medium text-tertiary mb-1">
                          {product.category}
                        </div>
                        <h3 className="font-semibold text-lg text-primary group-hover:text-primary-dark transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-soft">
                        <div>
                          {product.discount > 0 ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-primary">
                                $
                                {product.price -
                                  (product.price * product.discount) / 100}
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

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-tertiary hover:text-primary hover:bg-surface-1 rounded-lg"
                        >
                          <span className="text-xs font-medium">Detalles</span>
                          <div className="ml-1 h-3 w-3 border-r-2 border-b-2 border-current transform rotate-[-45deg]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 circuit-pattern-intense" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-soft mb-8">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">
              ÚNETE A LA INNOVACIÓN
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Transforma tu <span className="text-primary">Experiencia</span> con
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Tecnología de Vanguardia
            </span>
          </h2>

          <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Miles de profesionales y entusiastas ya confían en nuestra selección
            premium para potenciar su productividad y creatividad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GradientButton
              size="lg"
              className="px-10 py-4 rounded-xl hover-lift glow-primary transition-slower group"
            >
              <ShoppingCart className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              <span className="font-bold tracking-wider">
                COMENZAR A COMPRAR
              </span>
            </GradientButton>

            <Button
              size="lg"
              variant="outline"
              className="px-10 py-4 rounded-xl border-2 border-strong text-primary hover:bg-surface-1 hover:border-primary hover-lift transition-slower"
            >
              <span className="font-bold tracking-wider">EXPLORAR OFERTAS</span>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">✓</div>
              <div className="text-sm font-medium text-secondary">
                Garantía Extendida
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-2">✓</div>
              <div className="text-sm font-medium text-secondary">
                Soporte Premium
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">✓</div>
              <div className="text-sm font-medium text-secondary">
                Envío Prioritario
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
