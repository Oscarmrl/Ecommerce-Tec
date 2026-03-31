// Product types for filtering and API responses

import { Product as PrismaProduct, Category as PrismaCategory } from "@prisma/client";

export interface Product extends Omit<PrismaProduct, 'price' | 'comparePrice'> {
  price: string;
  comparePrice: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    value: string;
    price: string | null;
    inventory: number;
    sku: string | null;
  } | null;
}

export interface Category extends PrismaCategory {
  children: Category[];
}

export interface ProductFilters {
  category?: string | null;
  brands?: string[];
  processors?: string[];
  ram?: string[];
  storage?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
  error?: string;
}

export interface UseProductFiltersOptions {
  initialFilters?: Partial<ProductFilters>;
  initialPage?: number;
  pageSize?: number;
  debounceMs?: number;
}