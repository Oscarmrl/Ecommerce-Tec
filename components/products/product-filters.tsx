"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: Category[];
  parentId?: string | null;
}

interface ProductFiltersProps {
  categories: Category[];
}

const BRANDS = ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI"];
const PROCESSORS = ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const RAM_OPTIONS = ["8GB", "16GB", "32GB", "64GB"];
const STORAGE_OPTIONS = ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD", "2TB HDD"];

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Helper to get current values from URL
  const getCategory = () => searchParams.get('category') || null;
  const getBrands = () => searchParams.getAll('brand').filter(Boolean);
  const getProcessors = () => searchParams.getAll('processor').filter(Boolean);
  const getRam = () => searchParams.getAll('ram').filter(Boolean);
  const getStorage = () => searchParams.getAll('storage').filter(Boolean);
  const getMinPrice = () => searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const getMaxPrice = () => searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 5000;
  const getInStock = () => searchParams.get('inStock') === 'true';
  const getFeatured = () => searchParams.get('featured') === 'true';
  
  // Helper to update URL with new parameters
  const updateURL = (updates: Record<string, string | string[] | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove page param when filters change (reset to page 1)
    params.delete('page');
    
    Object.entries(updates).forEach(([key, value]) => {
      // Remove existing entries for this key (especially for arrays)
      params.delete(key);
      
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        // Already deleted, nothing to add
      } else if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (typeof value === 'number') {
        params.set(key, value.toString());
      } else {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  };
  
  // Individual filter handlers
  const handleCategoryChange = (categoryId: string | null) => {
    updateURL({ category: categoryId });
  };
  
  const handleBrandToggle = (brand: string) => {
    const currentBrands = getBrands();
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    updateURL({ brand: newBrands });
  };
  
  const handleProcessorToggle = (processor: string) => {
    const currentProcessors = getProcessors();
    const newProcessors = currentProcessors.includes(processor)
      ? currentProcessors.filter(p => p !== processor)
      : [...currentProcessors, processor];
    updateURL({ processor: newProcessors });
  };
  
  const handleRamToggle = (ram: string) => {
    const currentRam = getRam();
    const newRam = currentRam.includes(ram)
      ? currentRam.filter(r => r !== ram)
      : [...currentRam, ram];
    updateURL({ ram: newRam });
  };
  
  const handleStorageToggle = (storage: string) => {
    const currentStorage = getStorage();
    const newStorage = currentStorage.includes(storage)
      ? currentStorage.filter(s => s !== storage)
      : [...currentStorage, storage];
    updateURL({ storage: newStorage });
  };
  
  const handlePriceRangeChange = (range: [number, number]) => {
    const [min, max] = range;
    updateURL({ 
      minPrice: min > 0 ? min : null,
      maxPrice: max < 5000 ? max : null
    });
  };
  
  const handleInStockToggle = (checked: boolean) => {
    updateURL({ inStock: checked ? 'true' : null });
  };
  
  const handleFeaturedToggle = (checked: boolean) => {
    updateURL({ featured: checked ? 'true' : null });
  };
  
  const clearFilters = () => {
    router.replace(pathname, { scroll: false });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    getCategory() !== null ||
    getMinPrice() > 0 || getMaxPrice() < 5000 ||
    getBrands().length > 0 ||
    getProcessors().length > 0 ||
    getRam().length > 0 ||
    getStorage().length > 0 ||
    getInStock() ||
    getFeatured();
  
  return (
    <Card className="sticky top-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categorías */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categorías</Label>
          <div className="space-y-2">
            <Button
              variant={getCategory() === null ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleCategoryChange(null)}
            >
              Todas las categorías
            </Button>
             {categories.map((category) => (
               <div key={category.id} className="space-y-1">
                 <Button
                   variant={getCategory() === category.slug ? "default" : "ghost"}
                   size="sm"
                   className="w-full justify-start"
                   onClick={() => handleCategoryChange(category.slug)}
                 >
                   {category.name}
                 </Button>
                 {category.children.map((child) => (
                   <Button
                     key={child.id}
                     variant={getCategory() === child.slug ? "default" : "ghost"}
                     size="sm"
                     className="w-full justify-start pl-8 text-sm"
                     onClick={() => handleCategoryChange(child.slug)}
                   >
                     {child.name}
                   </Button>
                 ))}
               </div>
             ))}
          </div>
        </div>

        <Separator />

        {/* Rango de precio */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Precio: ${getMinPrice()} - ${getMaxPrice()}
          </Label>
          <Slider
            min={0}
            max={5000}
            step={100}
            value={[getMinPrice(), getMaxPrice()]}
            onValueChange={handlePriceRangeChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>$5000</span>
          </div>
        </div>

        <Separator />

        {/* Marcas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Marcas</Label>
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={getBrands().includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Procesadores */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Procesadores</Label>
          <div className="space-y-2">
            {PROCESSORS.map((processor) => (
              <div key={processor} className="flex items-center space-x-2">
                <Checkbox
                  id={`processor-${processor}`}
                  checked={getProcessors().includes(processor)}
                  onCheckedChange={() => handleProcessorToggle(processor)}
                />
                <Label
                  htmlFor={`processor-${processor}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {processor}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* RAM */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Memoria RAM</Label>
          <div className="space-y-2">
            {RAM_OPTIONS.map((ram) => (
              <div key={ram} className="flex items-center space-x-2">
                <Checkbox
                  id={`ram-${ram}`}
                  checked={getRam().includes(ram)}
                  onCheckedChange={() => handleRamToggle(ram)}
                />
                <Label
                  htmlFor={`ram-${ram}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {ram}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Almacenamiento */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Almacenamiento</Label>
          <div className="space-y-2">
            {STORAGE_OPTIONS.map((storage) => (
              <div key={storage} className="flex items-center space-x-2">
                <Checkbox
                  id={`storage-${storage}`}
                  checked={getStorage().includes(storage)}
                  onCheckedChange={() => handleStorageToggle(storage)}
                />
                <Label
                  htmlFor={`storage-${storage}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {storage}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtros adicionales */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Otros filtros</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={getInStock()}
                onCheckedChange={handleInStockToggle}
              />
              <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                Solo en stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={getFeatured()}
                onCheckedChange={handleFeaturedToggle}
              />
              <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                Solo destacados
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}