"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { Loader2, Home, MapPin, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, isLoading: cartLoading } = useCart();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "México",
    phone: "",
    isDefault: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);

  // Redirigir si no hay items en el carrito
  useEffect(() => {
    if (items.length === 0 && !cartLoading) {
      router.push("/cart");
    }
  }, [items, cartLoading, router]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/checkout");
    }
  }, [status, router]);

  // Cargar direcciones del usuario
  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      setIsFetchingAddresses(true);
      const response = await fetch("/api/addresses");
      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.data);
        // Seleccionar la dirección por defecto si existe
        const defaultAddress = data.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.data.length > 0) {
          setSelectedAddressId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
      toast.error("Error al cargar direcciones");
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  const handleCreateAddress = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Dirección creada exitosamente");
        setNewAddress({
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "México",
          phone: "",
          isDefault: false,
        });
        setShowNewAddress(false);
        await fetchAddresses();
        setSelectedAddressId(data.data.id);
      } else {
        toast.error(data.error || "Error al crear dirección");
      }
    } catch (error) {
      console.error("Error al crear dirección:", error);
      toast.error("Error al crear dirección");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Por favor selecciona una dirección de envío");
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      const orderData = {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId, // Usar misma dirección por ahora
        paymentMethod: paymentMethod === "credit_card" ? "Tarjeta de crédito" : 
                      paymentMethod === "debit_card" ? "Tarjeta de débito" : 
                      "Transferencia bancaria",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("¡Orden creada exitosamente!");
        await clearCart();
        router.push(`/orders/${data.data.id}`);
      } else {
        toast.error(data.error || "Error al crear la orden");
      }
    } catch (error) {
      console.error("Error al crear orden:", error);
      toast.error("Error al crear la orden");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + shipping + tax;

  if (status === "loading" || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Ya se redirige en el useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Información de envío y pago */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dirección de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFetchingAddresses ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id={address.id}
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mt-1"
                      />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <div className="border rounded-lg p-4 hover:bg-accent/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{address.street}</p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">{address.country}</p>
                              {address.phone && (
                                <p className="text-sm text-muted-foreground">Tel: {address.phone}</p>
                              )}
                            </div>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Predeterminada
                              </span>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tienes direcciones guardadas.</p>
              )}

              <Button
                variant="outline"
                onClick={() => setShowNewAddress(!showNewAddress)}
              >
                {showNewAddress ? "Cancelar" : "Agregar nueva dirección"}
              </Button>

              {showNewAddress && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Calle y número</Label>
                      <Input
                        id="street"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Av. Reforma 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Ciudad de México"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="CDMX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código postal</Label>
                      <Input
                        id="postalCode"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="06600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input
                        id="phone"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault">Establecer como dirección predeterminada</Label>
                  </div>
                  <Button onClick={handleCreateAddress} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Guardar dirección
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    type="radio"
                    id="credit_card"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                    <div className="border rounded-lg p-4 hover:bg-accent/50">
                      <div className="font-medium">Tarjeta de crédito</div>
                      <p className="text-sm text-muted-foreground">
                        Paga con tu tarjeta de crédito (simulado)
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="radio"
                    id="debit_card"
                    name="paymentMethod"
                    value="debit_card"
                    checked={paymentMethod === "debit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor="debit_card" className="flex-1 cursor-pointer">
                    <div className="border rounded-lg p-4 hover:bg-accent/50">
                      <div className="font-medium">Tarjeta de débito</div>
                      <p className="text-sm text-muted-foreground">
                        Paga con tu tarjeta de débito (simulado)
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <input
                    type="radio"
                    id="bank_transfer"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <div className="border rounded-lg p-4 hover:bg-accent/50">
                      <div className="font-medium">Transferencia bancaria</div>
                      <p className="text-sm text-muted-foreground">
                        Realiza una transferencia bancaria (simulado)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Resumen del pedido */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Productos ({items.length})</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (16%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !selectedAddressId}
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando orden...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar pedido
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al confirmar el pedido, aceptas nuestros Términos y Condiciones.
                Este es un sistema de prueba, no se realizarán cargos reales.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <div>
                  <p className="font-medium">Envío estimado</p>
                  <p>3-5 días hábiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}