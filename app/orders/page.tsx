"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, ShoppingBag, ArrowRight, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
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
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/orders?page=${page}&limit=10`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.pages);
      } else {
        toast.error(data.error || "Error al cargar las órdenes");
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "DELIVERED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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

  const getTotalItems = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mis Órdenes</h1>
            <p className="text-muted-foreground">
              Revisa el historial y estado de tus pedidos
            </p>
          </div>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Seguir comprando
            </Link>
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Filtrar por estado:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("PENDING")}
                >
                  Pendientes
                </Button>
                <Button
                  variant={statusFilter === "PROCESSING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("PROCESSING")}
                >
                  Procesando
                </Button>
                <Button
                  variant={statusFilter === "SHIPPED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("SHIPPED")}
                >
                  Enviados
                </Button>
                <Button
                  variant={statusFilter === "DELIVERED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("DELIVERED")}
                >
                  Entregados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de órdenes */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay órdenes</h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "all"
                  ? "Aún no has realizado ninguna orden."
                  : `No tienes órdenes con estado "${getStatusText(statusFilter)}".`}
              </p>
              <Button asChild>
                <Link href="/products">Explorar productos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Orden #{order.orderNumber}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {getPaymentStatusText(order.paymentStatus)}
                      </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{getTotalItems(order)} productos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/orders/${order.id}`}>
                      Ver detalles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Productos */}
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-3">Productos</h4>
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            {item.product.images && item.product.images.length > 0 ? (
                              <div
                                className="h-full w-full rounded-lg bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${item.product.images[0]})`,
                                }}
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="pt-2 text-center">
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 3} productos más
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <h4 className="font-medium mb-3">Dirección de envío</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.shippingAddress.street}</p>
                      <p className="text-muted-foreground">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                      <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                      <p className="text-muted-foreground">
                        CP: {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <Separator className="my-6" />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    ID de orden: <span className="font-mono">{order.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>Ver orden completa</Link>
                    </Button>
                    {order.status === "PENDING" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>Cancelar</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <div className="h-4 w-4 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <h4 className="font-semibold">Seguimiento de pedidos</h4>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones por email sobre el estado de tu pedido.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
              <div>
                <h4 className="font-semibold">Devoluciones</h4>
                <p className="text-sm text-muted-foreground">
                  Tienes 30 días para devolver productos no deseados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <div className="h-4 w-4 rounded-full bg-purple-600"></div>
              </div>
              <div>
                <h4 className="font-semibold">Soporte</h4>
                <p className="text-sm text-muted-foreground">
                  ¿Problemas con tu pedido? Contacta a nuestro soporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}