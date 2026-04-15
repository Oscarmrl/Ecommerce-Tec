"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

interface FeaturedProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    inventory: number;
    rating: number;
    brand?: string | null;
    featured: boolean;
    category: string;
    isNew: boolean;
    discount: number;
  };
  index: number;
}

export default function FeaturedProductCard({ product, index }: FeaturedProductCardProps) {
  const { addItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const gradients = [
    "from-primary/20 to-primary/5",
    "from-secondary/20 to-secondary/5",
    "from-accent/20 to-accent/5",
    "from-primary/20 to-accent/5",
  ];

  const accentColors = [
    "bg-primary text-primary-foreground hover:bg-primary-dark",
    "bg-secondary text-secondary-foreground hover:bg-secondary-dark",
    "bg-accent text-accent-foreground hover:bg-accent-dark",
    "bg-primary text-primary-foreground hover:bg-primary-dark",
  ];

  const iconColors = [
    "text-primary",
    "text-secondary",
    "text-accent",
    "text-primary",
  ];

  const PLACEHOLDER_IMG = "/images/placeholder-product.png";

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || PLACEHOLDER_IMG,
        slug: product.slug,
        inventory: product.inventory,
      });
      // Podríamos mostrar un toast aquí en el futuro
      console.log("Producto agregado al carrito");
    } catch (error: any) {
      console.error("Error al agregar al carrito:", error);
      const message = error?.message || "Error al agregar al carrito. Intenta nuevamente.";
      alert(message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-soft bg-surface-0 hover:border-primary/40 hover-lift transition-smooth">
      {/* Product Image Area */}
      <div className="relative aspect-square bg-gradient-to-br from-surface-1 to-surface-0 overflow-hidden">
        {/* Product Image */}
        <div className="absolute inset-0">
          <Image
            src={product.images[0] || PLACEHOLDER_IMG}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <div className="px-2 py-1 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              NUEVO
            </div>
          )}
          {product.discount > 0 && (
            <div className="px-2 py-1 rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-0/90 backdrop-blur-sm px-2 py-1 rounded-full border border-soft z-10">
          <Star className="w-3 h-3 fill-primary text-primary" />
          <span className="text-xs font-semibold text-primary">
            {product.rating.toFixed(1)}
          </span>
        </div>

        {/* Quick Action - Agregar al Carrito */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            className={`${accentColors[index]} rounded-full px-4 shadow-md hover-lift`}
            onClick={handleAddToCart}
            disabled={product.inventory === 0 || isAdding || isLoading}
          >
            <ShoppingCart className="w-3 h-3 mr-2" />
            {isAdding ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <div className="text-xs font-medium text-tertiary mb-1">
            {product.category}
          </div>
          <h3 className="font-semibold text-lg text-primary group-hover:text-primary-dark transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-soft">
          <div>
            {product.discount > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  $
                  {product.price - (product.price * product.discount) / 100}
                </span>
                <span className="text-sm text-tertiary line-through">
                  ${product.price}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                ${product.price}
              </span>
            )}
          </div>

          <Link href={`/products/${product.slug}`}>
            <Button
              size="sm"
              variant="ghost"
              className="text-tertiary hover:text-primary hover:bg-surface-1 rounded-lg"
            >
              <span className="text-xs font-medium">Detalles</span>
              <div className="ml-1 h-3 w-3 border-r-2 border-b-2 border-current transform rotate-[-45deg]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}