"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
} from "lucide-react";
import Link from "next/link";
// Formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tipos
type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  total: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

// Componente para mostrar el badge de estado
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const variants = {
    PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    PROCESSING: { label: "Procesando", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    SHIPPED: { label: "Enviado", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
    DELIVERED: { label: "Entregado", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  };
  
  return (
    <Badge className={`${variants[status].className} font-medium`}>
      {variants[status].label}
    </Badge>
  );
};

// Componente para mostrar el badge de estado de pago
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
  const variants = {
    PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    PAID: { label: "Pagado", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    FAILED: { label: "Fallido", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    REFUNDED: { label: "Reembolsado", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  };
  
  return (
    <Badge className={`${variants[status].className} font-medium`}>
      {variants[status].label}
    </Badge>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  
  // Fetch de órdenes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter);
      
      const response = await fetch(`/api/admin/orders?${params}`);
      const data: OrdersResponse = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Error al cargar órdenes");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar órdenes al montar y cuando cambien filtros/paginación
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, paymentFilter]);
  
  // Buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchOrders();
      } else {
        // Si estamos en otra página, volver a la primera
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);
  
  // Cambiar página
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Actualizar estado de orden
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar orden localmente
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Error al actualizar orden");
    }
  };
  
  // Estadísticas
  const stats = {
    pending: orders.filter(o => o.status === "PENDING").length,
    processing: orders.filter(o => o.status === "PROCESSING").length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    total: pagination.total,
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Órdenes</h1>
          <p className="text-muted-foreground">
            Administra y sigue todas las órdenes de TechStore
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchOrders()} disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold mt-2">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Procesando</p>
                <p className="text-3xl font-bold mt-2">{stats.processing}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregadas</p>
                <p className="text-3xl font-bold mt-2">{stats.delivered}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número de orden, cliente, email..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PROCESSING">Procesando</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                  <SelectItem value="DELIVERED">Entregado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID">Pagado</SelectItem>
                  <SelectItem value="FAILED">Fallido</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Todas las Órdenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando órdenes...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error al cargar órdenes</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchOrders}>Reintentar</Button>
            </div>
          )}
          
          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay órdenes</h3>
              <p className="text-muted-foreground mb-6">
                {search || statusFilter !== "all" || paymentFilter !== "all"
                  ? "No se encontraron órdenes con los filtros aplicados."
                  : "Aún no hay órdenes en el sistema."}
              </p>
              <Button variant="outline" onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}>
                Limpiar filtros
              </Button>
            </div>
          )}
          
          {!loading && !error && orders.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {order.itemsCount} items
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.user.name || "Sin nombre"}</div>
                          <div className="text-xs text-muted-foreground">{order.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentBadge status={order.paymentStatus} />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(order.total).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                          <div className="text-xs text-muted-foreground">
                            {formatTime(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(value: OrderStatus) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Cambiar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Marcar como Pendiente</SelectItem>
                              <SelectItem value="PROCESSING">Marcar como Procesando</SelectItem>
                              <SelectItem value="SHIPPED">Marcar como Enviado</SelectItem>
                              <SelectItem value="DELIVERED">Marcar como Entregado</SelectItem>
                              <SelectItem value="CANCELLED">Marcar como Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginación */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Mostrando {orders.length} de {pagination.total} órdenes
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}