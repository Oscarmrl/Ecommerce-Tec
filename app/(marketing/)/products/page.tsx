import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Filter, Grid, List, ShoppingCart, Star } from "lucide-react"

export default function ProductsPage() {
  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `Producto ${i + 1}`,
    price: 99.99 + i * 50,
    category: ["Smartphones", "Laptops", "Audio", "Accessories"][i % 4],
    rating: 4 + Math.random(),
    reviews: Math.floor(Math.random() * 100),
    image: "/placeholder-product.jpg",
    featured: i < 4,
  }))

  const categories = [
    "Todos",
    "Smartphones",
    "Laptops",
    "Tablets",
    "Audio",
    "Wearables",
    "Accesorios",
    "Gaming",
    "Smart Home",
  ]

  const brands = [
    "Apple",
    "Samsung",
    "Sony",
    "Microsoft",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Bose",
    "JBL",
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Nuestros Productos</h1>
          <p className="text-gray-600">
            Descubre nuestra amplia selección de productos tecnológicos
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <h3 className="font-semibold mb-2">Buscar</h3>
                  <Input placeholder="Nombre del producto..." />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-2">Categorías</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-semibold mb-2">Marcas</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center gap-2">
                        <input type="checkbox" id={brand} className="rounded" />
                        <label htmlFor={brand} className="text-sm">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-2">Rango de Precio</h3>
                  <Slider defaultValue={[0, 1000]} max={2000} step={10} />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>$0</span>
                    <span>$2000</span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-semibold mb-2">Calificación</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <input type="checkbox" id={`rating-${stars}`} className="rounded" />
                        <label htmlFor={`rating-${stars}`} className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm">y más</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Aplicar Filtros</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">12</span> de{" "}
                <span className="font-semibold">156</span> productos
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Select defaultValue="popular">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Más Populares</SelectItem>
                    <SelectItem value="newest">Más Nuevos</SelectItem>
                    <SelectItem value="price-low">Precio: Bajo a Alto</SelectItem>
                    <SelectItem value="price-high">Precio: Alto a Bajo</SelectItem>
                    <SelectItem value="rating">Mejor Calificados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all">
                  {product.featured && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        Destacado
                      </span>
                    </div>
                  )}
                  <div className="aspect-square bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-gray-400">Imagen del producto</div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.reviews})
                        </span>
                      </div>
                      <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      Descripción del producto. Características principales y especificaciones técnicas.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button variant="outline" size="icon">
                &lt;
              </Button>
              <Button variant="outline" className="w-10 h-10">1</Button>
              <Button variant="outline" className="w-10 h-10">2</Button>
              <Button variant="outline" className="w-10 h-10">3</Button>
              <span className="px-2">...</span>
              <Button variant="outline" className="w-10 h-10">10</Button>
              <Button variant="outline" size="icon">
                &gt;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}