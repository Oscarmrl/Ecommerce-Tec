"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Package,
  Heart
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/categories", label: "Categorías" },
    { href: "/deals", label: "Ofertas" },
    { href: "/about", label: "Nosotros" },
    { href: "/contact", label: "Contacto" },
  ]

  const categories = [
    "Smartphones",
    "Laptops",
    "Tablets",
    "Audio",
    "Wearables",
    "Accesorios",
    "Gaming",
    "Smart Home",
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Button variant="ghost" className="p-0" asChild>
               <Link href="/" className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent" />
                 <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                   TechStore
                 </span>
               </Link>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            {isLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Usuario"}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
               <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-xs text-primary-foreground shadow-sm">
                 3
               </span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-4 overflow-x-auto">
            {categories.map((category) => (
              <Button key={category} variant="ghost" size="sm" asChild>
                <Link href={`/categories/${category.toLowerCase()}`}>{category}</Link>
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Envío gratis en pedidos mayores a $500
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Button key={link.href} variant="ghost" className="justify-start" asChild>
                  <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                    {link.label}
                  </Link>
                </Button>
              ))}
              <div className="pt-4 border-t">
                <h4 className="px-4 py-2 text-sm font-semibold text-gray-500">Categorías</h4>
                <div className="grid grid-cols-2 gap-2 px-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
                      <Link
                        href={`/categories/${category.toLowerCase()}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}