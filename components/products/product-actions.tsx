"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

interface ProductActionsProps {
  productId: string;
  inventory: number;
  price: number;
  productName?: string;
  productImage?: string;
  productSlug?: string;
}

export default function ProductActions({ 
  productId, 
  inventory, 
  price,
  productName = "Producto",
  productImage = "",
  productSlug = ""
}: ProductActionsProps) {
  const { addItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        id: productId,
        name: productName,
        price,
        quantity: 1,
        image: productImage,
        slug: productSlug,
        inventory,
        productId, // pasar también como productId para API
      });
      // Podríamos mostrar un toast aquí
      console.log("Producto agregado al carrito");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      // Mostrar error al usuario
      alert("Error al agregar al carrito. Intenta nuevamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        id: productId,
        name: productName,
        price,
        quantity: 1,
        image: productImage,
        slug: productSlug,
        inventory,
        productId,
      });
      // Redirigir al checkout (cuando exista)
      // window.location.href = "/checkout";
      console.log("Redirigiendo al checkout...");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar al carrito. Intenta nuevamente.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="flex-1"
          disabled={inventory === 0 || isAdding || isLoading}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {inventory === 0 ? "Agotado" : isAdding ? "Agregando..." : "Agregar al Carrito"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={inventory === 0 || isAdding || isLoading}
          onClick={handleBuyNow}
        >
          {isAdding ? "Procesando..." : "Comprar ahora"}
        </Button>
      </div>
    </div>
  );
}