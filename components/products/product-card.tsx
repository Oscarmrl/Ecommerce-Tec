import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    images: string[];
    rating?: number | null;
    featured?: boolean;
    inventory: number;
    brand?: string | null;
    processor?: string | null;
    ram?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Sin imagen</div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-primary text-primary-foreground">Destacado</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-accent text-accent-foreground">-{discount}%</Badge>
            )}
            {product.inventory === 0 && (
              <Badge variant="destructive">Agotado</Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description || `${product.brand} • ${product.processor} • ${product.ram}`}
        </p>
        
        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={product.inventory === 0}
          onClick={() => {
            // TODO: Add to cart functionality
            console.log("Add to cart:", product.id);
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inventory === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}