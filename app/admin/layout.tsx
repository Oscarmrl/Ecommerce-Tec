"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import Link from "next/link";
import { checkClientRole } from "@/lib/client-auth-utils";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/orders",
    label: "Órdenes",
    icon: ShoppingBag,
  },
  {
    href: "/admin/products",
    label: "Productos",
    icon: Package,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: Users,
  },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }

    // Verificar rol ADMIN
    if (session?.user) {
      const isAdmin = checkClientRole(session.user.role, "ADMIN");
      if (!isAdmin) {
        router.push("/");
        return;
      }
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-soft bg-surface-0 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative h-8 w-8 rounded-lg gradient-tech-primary overflow-hidden group-hover:glow-primary transition-smooth">
                <div className="absolute inset-0 circuit-pattern-intense" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-sm bg-white/90" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TechStore Admin
                </span>
                <span className="text-xs text-tertiary tracking-wider font-mono">
                  PANEL DE CONTROL
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-secondary hover:text-primary hover:bg-surface-1"
                      asChild
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>

            {/* User info y acciones */}
            <div className="mt-auto pt-6 border-t border-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Volver a la tienda
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-r border-soft bg-surface-0">
          <div className="flex h-16 items-center justify-between px-6 border-b border-soft">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-lg gradient-tech-primary overflow-hidden">
                <div className="absolute inset-0 circuit-pattern-intense" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-sm bg-white/90" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-soft bg-surface-0/95 backdrop-blur-lg px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-primary">
                Panel de Administración
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestiona tu tienda TechStore
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rol: {session?.user?.role || "ADMIN"}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}