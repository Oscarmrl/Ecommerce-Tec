"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  ArrowRight,
  Calendar,
  User,
  BarChart3,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    newUsersLast30Days: number;
    lowStockCount: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    customer: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    inventory: number;
    price: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
    latestProduct: {
      id: string;
      name: string;
      price: number;
    } | null;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.error || "Error al cargar estadísticas");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "PROCESSING": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "SHIPPED": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "DELIVERED": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "CANCELLED": return "bg-red-100 text-red-800 hover:bg-red-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Panel de control de TechStore
            </p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Cargando...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Panel de control de TechStore - Resumen general
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Totales</p>
                <p className="text-3xl font-bold mt-2">{stats?.overview.totalUsers || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats?.overview.newUsersLast30Days || 0} últimos 30 días
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Totales</p>
                <p className="text-3xl font-bold mt-2">{stats?.overview.totalProducts || 0}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats?.overview.lowStockCount || 0} con bajo stock
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Órdenes Totales</p>
                <p className="text-3xl font-bold mt-2">{stats?.overview.totalOrders || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.recentOrders?.length || 0} recientes
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(stats?.overview.totalRevenue || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats?.monthlySales?.[stats.monthlySales.length - 1]?.orderCount || 0} órdenes este mes
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Órdenes Recientes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Orden #</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {order.customer?.name || "Cliente"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {order.customer?.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay órdenes recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Bajo Stock
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                {stats?.overview.lowStockCount || 0} productos
              </Badge>
            </CardHeader>
            <CardContent>
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {stats.lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <Badge
                        variant={product.inventory < 5 ? "destructive" : "outline"}
                        className={
                          product.inventory < 5
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {product.inventory} unidades
                      </Badge>
                    </div>
                  ))}
                  {stats.lowStockProducts.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/admin/products">
                        Ver todos ({stats.lowStockProducts.length})
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">Todo el stock está bien</p>
                  <p className="text-sm text-muted-foreground">
                    No hay productos con bajo inventario
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/admin/products/new">
                    <Package className="h-4 w-4 mr-2" />
                    Crear Nuevo Producto
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/orders">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Gestionar Órdenes
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Ver Usuarios
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Sales Chart (simplified) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ventas Mensuales (Últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.monthlySales && stats.monthlySales.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-2">
                {stats.monthlySales.map((sale, index) => {
                  const maxRevenue = Math.max(...stats.monthlySales.map(s => s.revenue));
                  const height = maxRevenue > 0 ? (sale.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={sale.month} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all hover:opacity-90"
                        style={{ height: `${height}%` }}
                      />
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium">{sale.month.slice(5)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(sale.revenue)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.monthlySales.map((sale) => (
                  <div key={sale.month} className="text-center p-3 rounded-lg border">
                    <p className="text-sm font-medium">{sale.month}</p>
                    <p className="text-2xl font-bold mt-2">
                      {formatCurrency(sale.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.orderCount} órdenes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}