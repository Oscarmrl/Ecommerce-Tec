"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, Package, Truck, Home, ArrowLeft, Printer, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand: string | null;
    price: number;
  };
  variant: {
    id: string;
    name: string;
    value: string;
    price: number;
  } | null;
  quantity: number;
  price: number;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface OrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsProps) {
  const { id } = await params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error(data.error || "Error al cargar la orden");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error al cargar orden:", error);
      toast.error("Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("¿Estás seguro de cancelar esta orden? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Orden cancelada exitosamente");
        setOrder(data.data);
      } else {
        toast.error(data.error || "Error al cancelar la orden");
      }
    } catch (error) {
      console.error("Error al cancelar orden:", error);
      toast.error("Error al cancelar la orden");
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5" />;
      case "PROCESSING":
        return <Package className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Pendiente",
      PROCESSING: "Procesando",
      SHIPPED: "Enviado",
      DELIVERED: "Entregado",
      CANCELLED: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Pendiente",
      PAID: "Pagado",
      FAILED: "Fallido",
      REFUNDED: "Reembolsado",
    };
    return statusMap[status] || status;
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
        <p className="text-muted-foreground mb-6">
          La orden que buscas no existe o no tienes permisos para verla.
        </p>
        <Button asChild>
          <Link href="/orders">Ver mis órdenes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Orden #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Realizada el {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a órdenes
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <h3 className="font-semibold">Estado del pedido</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{getStatusText(order.status)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>
              {order.status === "PENDING" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Cancelar orden
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Detalles del pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{order.shipping === 0 ? "Gratis" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de pago</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Información de envío */}
        <div className="space-y-6">
          {/* Dirección de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Dirección de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.user.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-muted-foreground">Tel: {order.shippingAddress.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dirección de facturación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dirección de facturación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress.id === order.billingAddress.id ? (
                <p className="text-muted-foreground">Misma que la dirección de envío</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">{order.user.name}</p>
                  <p>{order.billingAddress.street}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  {order.billingAddress.phone && (
                    <p className="text-muted-foreground">Tel: {order.billingAddress.phone}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">Cliente</p>
                <p>{order.user.name || "No especificado"}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p>{order.user.email}</p>
              </div>
              <div>
                <p className="font-medium">Número de orden</p>
                <p className="font-mono">{order.orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ayuda */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold">¿Necesitas ayuda?</h4>
                    <p className="text-sm text-muted-foreground">
                      Contacta a nuestro soporte si tienes preguntas sobre tu pedido.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Contactar soporte</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}