"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface InventoryStatusProps {
  productId: string;
  variantId?: string;
  showDetails?: boolean;
}

interface InventoryData {
  available: boolean;
  currentInventory: number;
  message?: string;
  lastUpdated: Date;
}

export default function InventoryStatus({ 
  productId, 
  variantId, 
  showDetails = false 
}: InventoryStatusProps) {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [productId, variantId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = variantId 
        ? `/api/products/variants/inventory?id=${variantId}`
        : `/api/products/inventory?id=${productId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setInventory({
          available: data.data.available,
          currentInventory: data.data.currentInventory,
          message: data.data.message,
          lastUpdated: new Date(),
        });
      } else {
        setError(data.error || "Error al cargar inventario");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (loading) {
      return (
        <Badge variant="outline" className="animate-pulse">
          <Package className="h-3 w-3 mr-1" />
          Cargando...
        </Badge>
      );
    }

    if (error) {
      return (
        <Badge variant="outline" className="border-destructive text-destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }

    if (!inventory) {
      return (
        <Badge variant="outline">
          <Package className="h-3 w-3 mr-1" />
          Desconocido
        </Badge>
      );
    }

    if (inventory.available) {
      if (inventory.currentInventory > 10) {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            En stock ({inventory.currentInventory})
          </Badge>
        );
      } else if (inventory.currentInventory > 0) {
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Últimas unidades ({inventory.currentInventory})
          </Badge>
        );
      }
    }

    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Agotado
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (!inventory || !showDetails) return null;

    if (inventory.available) {
      if (inventory.currentInventory > 10) {
        return (
          <p className="text-sm text-green-600">
            Disponible para envío inmediato
          </p>
        );
      } else if (inventory.currentInventory > 0) {
        return (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              ¡Últimas unidades! Solo quedan {inventory.currentInventory}. 
              Compra ahora antes de que se agoten.
            </AlertDescription>
          </Alert>
        );
      }
    }

    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Este producto está temporalmente agotado. 
          {inventory.message && ` ${inventory.message}`}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {inventory && (
          <span className="text-xs text-muted-foreground">
            Actualizado: {inventory.lastUpdated.toLocaleTimeString("es-ES", { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
      {getStatusMessage()}
    </div>
  );
}