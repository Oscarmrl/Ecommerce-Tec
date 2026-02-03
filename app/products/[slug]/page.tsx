import ProductDetails from "@/components/products/product-details";
import ProductSpecifications from "@/components/products/product-specifications";
import RelatedProducts from "@/components/products/related-products";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      category: true,
      variants: true,
      reviews: {
        where: {
          approved: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Obtener productos relacionados
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: {
        not: product.id,
      },
    },
    take: 4,
    include: {
      category: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductSpecifications product={product} />
        </div>
        <div>
          <div className="sticky top-8">
            {/* Aquí irían reviews, información de envío, etc. */}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}