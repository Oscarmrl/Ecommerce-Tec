"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  slug?: string;
  inventory?: number;
  productId?: string;
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";
  
  // Debug de sesión
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("CartProvider debug:", {
        status,
        isAuthenticated,
        isLoadingSession,
        sessionUserId: session?.user?.id,
        sessionUserEmail: session?.user?.email,
        sessionUserRole: session?.user?.role,
        hasSession: !!session,
      });
    }
  }, [status, isAuthenticated, isLoadingSession, session]);

  // Función para hacer fetch con manejo de errores
  const fetchApi = useCallback(async (url: string, options?: RequestInit) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`Fetch ${url}`, {
          method: options?.method || "GET",
          body: options?.body ? JSON.parse(options.body as string) : undefined,
        });
      }
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No autenticado");
        }
        
        // Intentar leer respuesta
        let errorText = `Error ${response.status}: ${response.statusText}`;
        let errorData: any = {};
        let rawText = '';
        
        try {
          rawText = await response.text();
          if (rawText) {
            // Verificar si es HTML (página de error)
            if (rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html') || rawText.includes('Next.js')) {
              errorText = `Error ${response.status}: La API devolvió HTML en lugar de JSON. Posible error interno del servidor.`;
              errorData = { isHtml: true, length: rawText.length };
            } else {
              try {
                errorData = JSON.parse(rawText);
                errorText = errorData.error || errorData.message || errorText;
              } catch {
                // Si no es JSON válido, mostrar el texto como está
                errorText = `Error ${response.status}: ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`;
                errorData = { rawText: rawText.substring(0, 500) };
              }
            }
          }
        } catch {
          // Error al leer la respuesta
          errorData = { readError: true };
        }
        
        console.error(`Error API ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          errorData,
          rawTextPreview: rawText ? rawText.substring(0, 200) + (rawText.length > 200 ? '...' : '') : '(vacío)'
        });
        throw new Error(errorText);
      }
      
      const data = await response.json();
      if (process.env.NODE_ENV === "development") {
        console.log(`Success ${url}:`, data);
      }
      return data;
    } catch (err) {
      console.error(`Error en fetch a ${url}:`, err);
      throw err;
    }
  }, []);

  // Cargar carrito desde API si está autenticado, o localStorage si no
  useEffect(() => {
    if (isLoadingSession) return;
    
    const loadCart = async () => {
      setIsLoading(true);
      setError(null);
      
       try {
         // Siempre intentar cargar desde API (ahora funciona con usuarios temporales)
         try {
           const data = await fetchApi("/api/cart");
           if (data.success && data.data && data.data.items) {
             // Convertir items de API a formato local
             const apiItems: CartItem[] = data.data.items.map((item: any) => ({
               id: item.id,
               productId: item.productId,
               name: item.product?.name || item.productName || "Producto",
               slug: item.product?.slug || item.productSlug,
               price: item.product?.price || item.price || 0,
               quantity: item.quantity,
               image: item.product?.images?.[0]?.url || item.productImage || "",
               variantId: item.variantId,
               inventory: item.product?.inventory,
             }));
             setItems(apiItems);
             return; // Salir si la API funciona
           }
         } catch (apiError) {
           console.log("API no disponible, usando localStorage:", apiError);
           // Continuar con localStorage
         }
         
         // Fallback a localStorage si API falla
         const savedCart = localStorage.getItem("cart");
         if (savedCart) {
           try {
             setItems(JSON.parse(savedCart));
           } catch (err) {
             console.error("Error al cargar carrito desde localStorage:", err);
             localStorage.removeItem("cart");
           }
         }
      } catch (err: any) {
        console.error("Error al cargar carrito:", err);
        setError(err.message);
        
        // Fallback a localStorage si hay error y no está autenticado
        if (!isAuthenticated) {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              setItems(JSON.parse(savedCart));
            } catch {}
          }
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, [isAuthenticated, isLoadingSession, fetchApi]);

  // Guardar carrito en localStorage cuando cambie y no esté autenticado
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized, isAuthenticated]);

  // Sincronizar con API cuando se autentique
  useEffect(() => {
    if (!isInitialized || isLoadingSession) return;
    
    if (isAuthenticated) {
      // Al autenticarse, subir carrito local a API
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        const syncLocalCart = async () => {
          try {
            const localItems = JSON.parse(localCart);
            if (localItems.length > 0) {
              // Subir cada item a la API
              for (const item of localItems) {
                try {
                  await fetchApi("/api/cart", {
                    method: "POST",
                    body: JSON.stringify({
                      productId: item.productId || item.id,
                      quantity: item.quantity,
                      variantId: item.variantId,
                    }),
                  });
                } catch (err) {
                  console.error("Error al sincronizar item:", err);
                }
              }
              
              // Limpiar localStorage después de sincronizar
              localStorage.removeItem("cart");
              
              // Recargar carrito desde API para obtener los nuevos cart item IDs
              try {
                const data = await fetchApi("/api/cart");
                if (data.success && data.data && data.data.items) {
                  const apiItems: CartItem[] = data.data.items.map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.product?.name || item.productName || "Producto",
                    slug: item.product?.slug || item.productSlug,
                    price: item.product?.price || item.price || 0,
                    quantity: item.quantity,
                    image: item.product?.images?.[0]?.url || item.productImage || "",
                    variantId: item.variantId,
                    inventory: item.product?.inventory,
                  }));
                  setItems(apiItems);
                }
              } catch (apiError) {
                console.error("Error al recargar carrito después de sincronización:", apiError);
              }
            }
          } catch (err) {
            console.error("Error al parsear carrito local:", err);
          }
        };
        syncLocalCart();
      }
    }
  }, [isAuthenticated, isInitialized, isLoadingSession, fetchApi]);

  const addItem = async (newItem: CartItem) => {
    setError(null);
    
    if (isAuthenticated) {
      if (process.env.NODE_ENV === "development") {
        console.log("addItem - Autenticado, enviando a API:", {
          productId: newItem.productId || newItem.id,
          quantity: newItem.quantity,
          variantId: newItem.variantId,
          sessionStatus: status,
          isAuthenticated,
        });
      }
      try {
        setIsLoading(true);
        // Usar API principal (ahora funciona con usuarios temporales)
        const data = await fetchApi("/api/cart", {
          method: "POST",
          body: JSON.stringify({
            productId: newItem.productId || newItem.id,
            quantity: newItem.quantity,
            variantId: newItem.variantId,
          }),
        });
        
        if (data.success) {
          // Actualizar desde respuesta de API
          const apiItem = data.data;
          setItems((prevItems) => {
            const existingItem = prevItems.find((item) => 
              item.productId === apiItem.productId && item.variantId === apiItem.variantId
            );
            
            if (existingItem) {
              return prevItems.map((item) =>
                item.productId === apiItem.productId && item.variantId === apiItem.variantId
                  ? { 
                      ...item, 
                      id: apiItem.id, // Asegurar que tenemos el cart item ID correcto
                      quantity: apiItem.quantity,
                      price: apiItem.price,
                      total: apiItem.total
                    }
                  : item
              );
            } else {
              // Convertir item de API a formato local
              const newCartItem: CartItem = {
                id: apiItem.id,
                productId: apiItem.productId,
                name: apiItem.productName,
                slug: apiItem.productSlug,
                price: apiItem.price,
                quantity: apiItem.quantity,
                image: apiItem.productImage || "",
                variantId: apiItem.variantId,
              };
              return [...prevItems, newCartItem];
            }
          });
        }
      } catch (err: any) {
        console.error("Error en addItem (API):", err);
        console.error("Stack trace:", err.stack);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Modo local: generar un ID único basado en productId y variantId
      const localItemId = newItem.variantId 
        ? `${newItem.productId || newItem.id}-${newItem.variantId}`
        : newItem.productId || newItem.id;
      
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => 
          item.id === localItemId || 
          (item.productId === (newItem.productId || newItem.id) && item.variantId === newItem.variantId)
        );
        
        if (existingItem) {
          return prevItems.map((item) =>
            (item.id === localItemId) || 
            (item.productId === (newItem.productId || newItem.id) && item.variantId === newItem.variantId)
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          // Crear nuevo item con ID local único
          const localCartItem: CartItem = {
            ...newItem,
            id: localItemId,
            productId: newItem.productId || newItem.id,
          };
          return [...prevItems, localCartItem];
        }
      });
    }
  };

  const removeItem = async (id: string) => {
    setError(null);
    
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await fetchApi(`/api/cart?itemId=${id}`, {
          method: "DELETE",
        });
        
        // Actualizar items localmente
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }
    
    setError(null);
    
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await fetchApi("/api/cart", {
          method: "PUT",
          body: JSON.stringify({
            itemId: id,
            quantity,
          }),
        });
        
        // Actualizar items localmente
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    setError(null);
    
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        // Eliminar todos los items uno por uno (la API no tiene clear)
        for (const item of items) {
          await fetchApi(`/api/cart?itemId=${item.id}`, {
            method: "DELETE",
          });
        }
        setItems([]);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
    }
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotalPrice,
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}