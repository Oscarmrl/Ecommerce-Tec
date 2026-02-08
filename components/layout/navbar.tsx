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
    <header className="sticky top-0 z-50 w-full border-b border-soft bg-surface-0/95 backdrop-blur-lg supports-[backdrop-filter]:bg-surface-0/80 transition-smooth">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Button variant="ghost" className="p-0 hover:bg-transparent" asChild>
               <Link href="/" className="flex items-center gap-3 group">
                 <div className="relative h-9 w-9 rounded-lg gradient-tech-primary overflow-hidden group-hover:glow-primary transition-smooth">
                   <div className="absolute inset-0 circuit-pattern-intense" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="h-5 w-5 rounded-sm bg-white/90" />
                   </div>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                     TechStore
                   </span>
                   <span className="text-xs text-tertiary tracking-wider font-mono">TECHNOLOGY</span>
                 </div>
               </Link>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Button 
                key={link.href} 
                variant="ghost" 
                className="relative px-4 py-2 text-sm font-medium text-secondary hover:text-primary rounded-lg hover:bg-surface-1 transition-smooth group"
                asChild
              >
                <Link href={link.href}>
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-x-1/2 group-hover:w-3/4 transition-all duration-300" />
                </Link>
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-lg hover:bg-surface-1 text-tertiary hover:text-primary transition-smooth"
              >
                <Search className="h-4 w-4" />
              </Button>
              <div className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-x-1/2 group-hover:w-3/4 transition-all duration-300" />
            </div>
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
            <Button 
              variant="ghost" 
              size="icon"
              className="relative rounded-lg hover:bg-surface-1 text-tertiary hover:text-primary transition-smooth group"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full gradient-tech-primary text-xs font-medium text-primary-foreground shadow-md group-hover:glow-primary transition-smooth">
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
        <div className="hidden md:flex items-center justify-between py-3 border-t border-soft">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button 
                key={category} 
                variant="ghost" 
                size="sm"
                className="px-3 py-1.5 text-xs font-medium text-tertiary hover:text-primary hover:bg-surface-1 rounded-md transition-smooth border border-transparent hover:border-soft"
                asChild
              >
                <Link href={`/categories/${category.toLowerCase()}`}>
                  {category}
                </Link>
              </Button>
            ))}
          </div>
          <div className="text-xs font-medium text-tertiary tracking-wide">
            <span className="text-primary font-semibold">ENVÍO GRATIS</span> en pedidos &gt; $500
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