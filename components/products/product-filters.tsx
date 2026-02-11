"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  category: string | null;
  priceRange: [number, number];
  brands: string[];
  processors: string[];
  ram: string[];
  storage: string[];
  inStock: boolean;
  featured: boolean;
}

const BRANDS = ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI"];
const PROCESSORS = ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const RAM_OPTIONS = ["8GB", "16GB", "32GB", "64GB"];
const STORAGE_OPTIONS = ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "1TB HDD", "2TB HDD"];

export default function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    priceRange: [0, 5000],
    brands: [],
    processors: [],
    ram: [],
    storage: [],
    inStock: false,
    featured: false,
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    handleFilterChange("brands", newBrands);
  };

  const handleProcessorToggle = (processor: string) => {
    const newProcessors = filters.processors.includes(processor)
      ? filters.processors.filter(p => p !== processor)
      : [...filters.processors, processor];
    handleFilterChange("processors", newProcessors);
  };

  const handleRamToggle = (ram: string) => {
    const newRam = filters.ram.includes(ram)
      ? filters.ram.filter(r => r !== ram)
      : [...filters.ram, ram];
    handleFilterChange("ram", newRam);
  };

  const handleStorageToggle = (storage: string) => {
    const newStorage = filters.storage.includes(storage)
      ? filters.storage.filter(s => s !== storage)
      : [...filters.storage, storage];
    handleFilterChange("storage", newStorage);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      category: null,
      priceRange: [0, 5000],
      brands: [],
      processors: [],
      ram: [],
      storage: [],
      inStock: false,
      featured: false,
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = 
    filters.category !== null ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ||
    filters.brands.length > 0 ||
    filters.processors.length > 0 ||
    filters.ram.length > 0 ||
    filters.storage.length > 0 ||
    filters.inStock ||
    filters.featured;

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
              variant={filters.category === null ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleFilterChange("category", null)}
            >
              Todas las categorías
            </Button>
            {categories.map((category) => (
              <div key={category.id} className="space-y-1">
                <Button
                  variant={filters.category === category.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFilterChange("category", category.id)}
                >
                  {category.name}
                </Button>
                {category.children.map((child) => (
                  <Button
                    key={child.id}
                    variant={filters.category === child.id ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start pl-8 text-sm"
                    onClick={() => handleFilterChange("category", child.id)}
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
            Precio: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <Slider
            min={0}
            max={5000}
            step={100}
            value={filters.priceRange}
            onValueChange={(value) => handleFilterChange("priceRange", value)}
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
                  checked={filters.brands.includes(brand)}
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
                  checked={filters.processors.includes(processor)}
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
                  checked={filters.ram.includes(ram)}
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
                  checked={filters.storage.includes(storage)}
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
                checked={filters.inStock}
                onCheckedChange={(checked: boolean) => handleFilterChange("inStock", checked)}
              />
              <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                Solo en stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured}
                onCheckedChange={(checked: boolean) => handleFilterChange("featured", checked)}
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