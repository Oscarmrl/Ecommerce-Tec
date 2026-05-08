"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  featured: boolean;
  inventory: number;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  display: string;
  os: string;
  weight: string;
  battery: string;
  tags: string[];
  images: string[];
}

interface ProductFormProps {
  initialData?: ProductFormData | null;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    categoryId: "",
    featured: false,
    inventory: 0,
    brand: "",
    processor: "",
    ram: "",
    storage: "",
    graphics: "",
    display: "",
    os: "",
    weight: "",
    battery: "",
    tags: [],
    images: [],
  });

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (productId && initialData === undefined) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/products?id=${productId}`);
          const data = await res.json();
          if (data.success) {
            const product = data.data;
            setFormData({
              name: product.name,
              slug: product.slug,
              description: product.description || "",
              shortDescription: product.shortDescription || "",
              price: product.price,
              comparePrice: product.comparePrice || "",
              categoryId: product.category?.id || "",
              featured: product.featured,
              inventory: product.inventory,
              brand: product.brand || "",
              processor: product.processor || "",
              ram: product.ram || "",
              storage: product.storage || "",
              graphics: product.graphics || "",
              display: product.display || "",
              os: product.os || "",
              weight: product.weight || "",
              battery: product.battery || "",
              tags: product.tags || [],
              images: product.images || [],
            });
          }
        } catch (error) {
          console.error("Error al cargar producto:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [productId, initialData]);

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addImage = () => {
    const trimmed = imageInput.trim();
    if (trimmed && !formData.images.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, trimmed] }));
      setImageInput("");
    }
  };

  const removeImage = (image: string) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((i) => i !== image) }));
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    handleChange("slug", slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      inventory: parseInt(String(formData.inventory)) || 0,
    };

    try {
      const url = productId ? `/api/products?id=${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar producto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando producto...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej. Laptop Gaming HP Omen 16"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="laptop-gaming-hp-omen-16"
                  required
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descripción corta</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleChange("shortDescription", e.target.value)}
              placeholder="Breve descripción para listados"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción detallada del producto..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="999.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Precio comparación</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.comparePrice}
                onChange={(e) => handleChange("comparePrice", e.target.value)}
                placeholder="1199.99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventario *</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => handleChange("inventory", parseInt(e.target.value) || 0)}
                placeholder="50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleChange("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="Ej. HP, Dell, Apple"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange("featured", checked)}
            />
            <Label htmlFor="featured">Producto destacado</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Especificaciones técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processor">Procesador</Label>
              <Input
                id="processor"
                value={formData.processor}
                onChange={(e) => handleChange("processor", e.target.value)}
                placeholder="Ej. Intel Core i7 13700H"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ram">Memoria RAM</Label>
              <Input
                id="ram"
                value={formData.ram}
                onChange={(e) => handleChange("ram", e.target.value)}
                placeholder="Ej. 16GB DDR5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Almacenamiento</Label>
              <Input
                id="storage"
                value={formData.storage}
                onChange={(e) => handleChange("storage", e.target.value)}
                placeholder="Ej. 1TB SSD NVMe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graphics">Tarjeta gráfica</Label>
              <Input
                id="graphics"
                value={formData.graphics}
                onChange={(e) => handleChange("graphics", e.target.value)}
                placeholder="Ej. NVIDIA RTX 4060 8GB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display">Pantalla</Label>
              <Input
                id="display"
                value={formData.display}
                onChange={(e) => handleChange("display", e.target.value)}
                placeholder="Ej. 16.1” QHD 165Hz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="os">Sistema operativo</Label>
              <Input
                id="os"
                value={formData.os}
                onChange={(e) => handleChange("os", e.target.value)}
                placeholder="Ej. Windows 11 Home"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="Ej. 2.3 kg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="battery">Batería</Label>
              <Input
                id="battery"
                value={formData.battery}
                onChange={(e) => handleChange("battery", e.target.value)}
                placeholder="Ej. 83 Wh"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URLs de imágenes</Label>
            <div className="flex gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.images.map((image, index) => (
              <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                {image.length > 30 ? `${image.substring(0, 30)}...` : image}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeImage(image)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etiquetas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agregar etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ej. gaming, laptop, portátil"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {productId ? "Actualizar producto" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}