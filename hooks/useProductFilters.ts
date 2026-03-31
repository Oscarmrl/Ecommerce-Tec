"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ProductFilters,
  ProductsResponse,
  Pagination,
  Product,
} from "@/types/product";
import { useDebounce } from "./useDebounce";

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_DEBOUNCE_MS = 300;

interface UseProductFiltersReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  filters: ProductFilters;
  pagination: Pagination | null;
  error: string | null;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => void;
  updateFilters: (updates: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  loadMore: () => void;
  refresh: () => void;
  hasMore: boolean;
  isEmpty: boolean;
}

// ─── Helper: build query string FROM filters object (not from URL) ────────────
function filtersToParams(
  filters: ProductFilters,
  page: number,
  pageSize: number,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.featured) params.set("featured", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  filters.brands?.forEach((b) => params.append("brand", b));
  filters.processors?.forEach((p) => params.append("processor", p));
  filters.ram?.forEach((r) => params.append("ram", r));
  filters.storage?.forEach((s) => params.append("storage", s));

  if (page > 1) params.set("page", String(page));
  params.set("limit", String(pageSize));

  return params;
}

// ─── Helper: parse filters from URL search params ────────────────────────────
function parseFiltersFromParams(searchParams: URLSearchParams): ProductFilters {
  return {
    category: searchParams.get("category") || undefined,
    brands: searchParams.getAll("brand").filter(Boolean),
    processors: searchParams.getAll("processor").filter(Boolean),
    ram: searchParams.getAll("ram").filter(Boolean),
    storage: searchParams.getAll("storage").filter(Boolean),
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    inStock: searchParams.get("inStock") === "true",
    featured: searchParams.get("featured") === "true",
    search: searchParams.get("search") || undefined,
    sortBy:
      (searchParams.get("sortBy") as ProductFilters["sortBy"]) || "createdAt",
    sortOrder:
      (searchParams.get("sortOrder") as ProductFilters["sortOrder"]) || "desc",
  };
}

export function useProductFilters(
  options: {
    initialFilters?: Partial<ProductFilters>;
    pageSize?: number;
    debounceMs?: number;
  } = {},
): UseProductFiltersReturn {
  const {
    initialFilters = {},
    pageSize = DEFAULT_PAGE_SIZE,
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize filters from URL (runs once on mount)
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...parseFiltersFromParams(new URLSearchParams(searchParams?.toString())),
    ...initialFilters,
  }));

  const debouncedFilters = useDebounce(filters, debounceMs);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FIX: Track whether the filter change came from the user (internal) or from
  // the URL (external navigation like browser back/forward). This prevents the
  // sync-from-URL effect from re-triggering a fetch that already happened.
  const isInternalUpdateRef = useRef(false);

  // ── Fetch products ─────────────────────────────────────────────────────────
  // FIX: fetchProducts NO longer depends on `searchParams`. It builds the query
  // string from the `filtersArg` parameter, breaking the circular dependency:
  //   searchParams → fetchProducts recreated → useEffect re-fires → loop
  const fetchProducts = useCallback(
    async (
      filtersArg: ProductFilters,
      page: number = 1,
      append: boolean = false,
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        // Build URL from filters object — NOT from searchParams
        const params = filtersToParams(filtersArg, page, pageSize);

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ProductsResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch products");
        }

        if (append && page > 1) {
          setProducts((prev) => [...prev, ...data.data]);
        } else {
          setProducts(data.data);
        }

        setPagination(data.pagination);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
        if (!append) {
          setProducts([]);
          setPagination(null);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [pageSize],
  ); // FIX: only `pageSize` — no searchParams dependency

  // ── Effect: fetch when debouncedFilters change ─────────────────────────────
  // FIX: Fetch products when filters change, but do NOT update URL here.
  // URL updates are handled by UI components (ProductFilters, sort select, etc.)
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(debouncedFilters, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]); // Only debouncedFilters

  // ── Effect: sync filters FROM URL (browser back/forward only) ─────────────
  // FIX: Guard with `isInternalUpdateRef` so that URL changes we ourselves
  // caused above do NOT trigger another setFilters → another fetch → loop.
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const newFilters = parseFiltersFromParams(
      new URLSearchParams(searchParams?.toString()),
    );
    setFilters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newFilters)) return prev;
      return newFilters;
    });
    
    // Sync current page from URL
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
  }, [searchParams]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateFilter = useCallback(
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (
          key === "minPrice" &&
          typeof value === "number" &&
          prev.maxPrice !== undefined &&
          value > prev.maxPrice
        ) {
          next.maxPrice = value;
        }
        if (
          key === "maxPrice" &&
          typeof value === "number" &&
          prev.minPrice !== undefined &&
          value < prev.minPrice
        ) {
          next.minPrice = value;
        }
        return next;
      });
    },
    [],
  );

  const updateFilters = useCallback((updates: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const updatePage = useCallback((page: number) => {
    isInternalUpdateRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
    setCurrentPage(page);
  }, [searchParams, pathname, router]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !pagination?.hasNextPage) return;
    const nextPage = currentPage + 1;
    updatePage(nextPage);
    fetchProducts(filters, nextPage, true);
  }, [loading, loadingMore, pagination, currentPage, filters, fetchProducts, updatePage]);

  const refresh = useCallback(() => {
    fetchProducts(filters, currentPage, false);
  }, [filters, currentPage, fetchProducts]);

  return {
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
    hasMore: !!pagination?.hasNextPage,
    isEmpty: !loading && products.length === 0,
  };
}
