'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/product-grid';
import ProductFilters from '@/components/products/product-filters';
import { useProductFilters } from '@/hooks/useProductFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Category } from '@/types/product';

// Mock categories for now - will be fetched from API
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Laptops',
    slug: 'laptops',
    description: null,
    image: null,
    icon: null,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [
      {
        id: '2',
        name: 'Gaming',
        slug: 'gaming-laptops',
        description: null,
        image: null,
        icon: null,
        parentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      },
      {
        id: '3',
        name: 'Ultrabooks',
        slug: 'ultrabooks',
        description: null,
        image: null,
        icon: null,
        parentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      }
    ]
  },
  {
    id: '4',
    name: 'Desktop',
    slug: 'desktop',
    description: null,
    image: null,
    icon: null,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [
      {
        id: '5',
        name: 'Gaming PC',
        slug: 'gaming-pc',
        description: null,
        image: null,
        icon: null,
        parentId: '4',
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      },
      {
        id: '6',
        name: 'Workstation',
        slug: 'workstation',
        description: null,
        image: null,
        icon: null,
        parentId: '4',
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      }
    ]
  }
];

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const {
    products,
    loading,
    loadingMore,
    filters,
    pagination,
    error,
    updateFilter,
    updateFilters,
    clearFilters,
    loadMore,
    refresh,
    hasMore,
    isEmpty
  } = useProductFilters({
    pageSize: 12,
    debounceMs: 300,
  });

  // Handle infinite scroll with Intersection Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    
    const sentinel = document.getElementById('load-more-sentinel');
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '100px' } // Load when sentinel is 100px from viewport
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let sortBy: 'createdAt' | 'price' | 'rating' | 'name' = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    
    switch (value) {
      case 'price-asc':
        sortBy = 'price';
        sortOrder = 'asc';
        break;
      case 'price-desc':
        sortBy = 'price';
        sortOrder = 'desc';
        break;
      case 'rating-desc':
        sortBy = 'rating';
        sortOrder = 'desc';
        break;
      case 'name-asc':
        sortBy = 'name';
        sortOrder = 'asc';
        break;
      default:
        sortBy = 'createdAt';
        sortOrder = 'desc';
    }
    
    // Update URL with new sort parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page'); // Reset to page 1 when sorting changes
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const getSortValue = () => {
    const { sortBy, sortOrder } = filters;
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? 'price-asc' : 'price-desc';
    }
    if (sortBy === 'rating') {
      return 'rating-desc'; // Only descending for rating
    }
    if (sortBy === 'name') {
      return 'name-asc';
    }
    return 'createdAt-desc';
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          {loading ? (
            <div className="h-6 w-32 bg-surface-2 rounded animate-pulse"></div>
          ) : (
            <p className="text-muted-foreground">
              Mostrando {products.length} de {pagination?.total || 0} productos
              {filters.search && (
                <span> para &quot;{filters.search}&quot;</span>
              )}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <select 
            className="bg-background border border-input rounded-lg px-3 py-2 text-sm h-10"
            value={getSortValue()}
            onChange={handleSortChange}
            disabled={loading}
          >
            <option value="createdAt-desc">Ordenar por: Más recientes</option>
            <option value="price-asc">Precio: Menor a mayor</option>
            <option value="price-desc">Precio: Mayor a menor</option>
            <option value="rating-desc">Mejor calificados</option>
            <option value="name-asc">Nombre: A-Z</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-soft rounded-xl overflow-hidden">
              <div className="aspect-square bg-surface-2 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-2 rounded animate-pulse"></div>
                <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-surface-2 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Products grid */}
          <ProductGrid products={products} />
          
          {/* Empty state */}
          {isEmpty && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground mb-6">
                Intenta con otros filtros o categorías
              </p>
              <Button onClick={clearFilters}>
                Limpiar todos los filtros
              </Button>
            </div>
          )}
          
          {/* Infinite scroll sentinel */}
          {hasMore && !isEmpty && (
            <>
              <div 
                id="load-more-sentinel" 
                className="h-px w-full"
                aria-hidden="true"
              />
              <div className="mt-8 text-center">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="min-w-32"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más productos'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {pagination?.total && pagination.total - products.length} productos restantes
                </p>
              </div>
            </>
          )}
          
          {/* No more products */}
          {!hasMore && products.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                ¡Has visto todos los productos!
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep mock categories as fallback
      }
    };
    
    fetchCategories();
  }, []);



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Computadoras y Laptops
        </h1>
        <p className="text-muted-foreground">
          Encuentra la computadora perfecta para tus necesidades
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
        >
          <span>Filtros</span>
          {isFiltersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className={`lg:w-1/4 ${isFiltersCollapsed ? 'hidden lg:block' : ''}`}>
          <Suspense fallback={
            <Card className="sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse"></div>
                ))}
              </CardContent>
            </Card>
          }>
            <ProductFilters 
              categories={categories} 
            />
          </Suspense>
        </div>

        {/* Products grid */}
        <div className="lg:w-3/4">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-soft rounded-xl overflow-hidden">
                  <div className="aspect-square bg-surface-2 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-4 bg-surface-2 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-surface-2 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <ProductsContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}