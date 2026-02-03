"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, User, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
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