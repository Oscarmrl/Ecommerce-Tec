import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Smartphone, Laptop, Headphones, Star, Truck, Shield, RefreshCw, Sparkles } from "lucide-react"

export default function HomePage() {
  const categories = [
    { name: "Smartphones", icon: Smartphone, count: 45 },
    { name: "Laptops", icon: Laptop, count: 32 },
    { name: "Audio", icon: Headphones, count: 28 },
    { name: "Accessories", icon: ShoppingCart, count: 67 },
  ]

  const featuredProducts = [
    { id: 1, name: "iPhone 15 Pro", price: 999, image: "/placeholder-product.jpg", category: "Smartphones", rating: 4.8, isNew: true, discount: 10 },
    { id: 2, name: "MacBook Pro M3", price: 1299, image: "/placeholder-product.jpg", category: "Laptops", rating: 4.9, isNew: false, discount: 0 },
    { id: 3, name: "Sony WH-1000XM5", price: 399, image: "/placeholder-product.jpg", category: "Audio", rating: 4.7, isNew: true, discount: 15 },
    { id: 4, name: "Samsung Galaxy S24", price: 899, image: "/placeholder-product.jpg", category: "Smartphones", rating: 4.6, isNew: false, discount: 5 },
  ]

  const features = [
    { icon: Truck, title: "Envío Gratis", description: "En pedidos mayores a $500" },
    { icon: Shield, title: "Garantía", description: "2 años en todos los productos" },
    { icon: RefreshCw, title: "Devoluciones", description: "30 días para devoluciones" },
    { icon: Star, title: "Calidad", description: "Productos certificados" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">TechStore - Tu Tienda de Tecnología</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubre los últimos dispositivos electrónicos, computadoras y accesorios al mejor precio
          </p>
          <div className="flex gap-4 justify-center">
            <GradientButton size="lg" gradient="rainbow" className="animate-pulse-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              Ver Productos
            </GradientButton>
            <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300">
              Ofertas Especiales
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const colors = [
                "bg-primary/10 text-primary",
                "bg-secondary/10 text-secondary", 
                "bg-accent/10 text-accent",
                "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              ]
              return (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full ${colors[index]} mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Categorías Populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const colors = [
                "text-primary",
                "text-secondary",
                "text-accent", 
                "text-purple-600 dark:text-purple-400"
              ]
              return (
                <Card key={category.name} className="hover:shadow-lg transition-shadow hover:scale-[1.02]">
                  <CardContent className="p-6 text-center">
                    <category.icon className={`w-12 h-12 mx-auto mb-4 ${colors[index]}`} />
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground">{category.count} productos</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Productos Destacados</h2>
              <p className="text-muted-foreground mt-2">Los productos más populares de nuestra tienda</p>
            </div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => {
               const accentColors = [
                 "bg-primary text-primary-foreground hover:bg-primary/90",
                 "bg-secondary text-secondary-foreground hover:bg-secondary/90", 
                 "bg-accent text-accent-foreground hover:bg-accent/90",
                 "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
               ]
              
              const textColors = [
                "text-primary",
                "text-secondary",
                "text-accent",
                "text-purple-600 dark:text-purple-400"
              ]
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all group border-2 hover:border-primary/30">
                  <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-background/50">
                     {product.isNew && (
                       <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white border-0">
                         Nuevo
                       </Badge>
                     )}
                    {product.discount > 0 && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${textColors[index]}`}>
                              ${product.price - (product.price * product.discount / 100)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold">${product.price}</span>
                        )}
                      </div>
                      <Button size="sm" className={accentColors[index]}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para mejorar tu tecnología?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos que ya confían en nosotros
          </p>
          <GradientButton size="lg" gradient="rainbow" className="btn-glow-primary">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Comenzar a Comprar
          </GradientButton>
        </div>
      </section>
    </div>
  )
}