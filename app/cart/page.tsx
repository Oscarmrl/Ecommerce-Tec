import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const cartItems = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      price: 999.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
      category: "Smartphones",
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      price: 1299.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=center",
      category: "Laptops",
    },
    {
      id: 3,
      name: "Sony WH-1000XM5",
      price: 399.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
      category: "Audio",
    },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 500 ? 0 : 29.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Carrito de Compras</h1>
          <p className="text-gray-600">
            Revisa tus productos antes de proceder al pago
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">
              Agrega algunos productos para comenzar a comprar
            </p>
            <Button asChild>
              <Link href="/products">Ver Productos</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>Productos ({cartItems.length})</CardTitle>
                  <CardDescription>
                    Puedes modificar las cantidades o eliminar productos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[400px]">Producto</TableHead>
                        <TableHead className="text-center">Precio</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                           <TableCell>
                             <div className="flex items-center gap-4">
                               <img 
                                 src={item.image} 
                                 alt={item.name}
                                 className="h-20 w-20 rounded-lg object-cover"
                               />
                               <div>
                                 <h3 className="font-semibold">{item.name}</h3>
                                 <p className="text-sm text-gray-500">{item.category}</p>
                               </div>
                             </div>
                           </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/products">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continuar Comprando
                    </Link>
                  </Button>
                  <Button variant="outline">Actualizar Carrito</Button>
                </CardFooter>
              </Card>

              {/* Coupon Code */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Código de Descuento</CardTitle>
                  <CardDescription>
                    Ingresa tu código promocional si tienes uno
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input placeholder="Código promocional" />
                    <Button>Aplicar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                      {shipping === 0 ? "GRATIS" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        ¡Felicidades! Tienes envío gratis
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Al proceder al pago, aceptas nuestros{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Términos y Condiciones
                    </Link>
                  </p>
                </CardFooter>
              </Card>

              {/* Security Info */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <div className="h-4 w-4 rounded-full bg-green-600"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Pago Seguro</h4>
                        <p className="text-sm text-gray-500">
                          Tu información está protegida con encriptación SSL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Garantía de Devolución</h4>
                        <p className="text-sm text-gray-500">
                          30 días para devoluciones sin complicaciones
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}