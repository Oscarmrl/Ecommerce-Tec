import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Youtube, CreditCard, Truck, Shield, Headphones } from "lucide-react"

export default function Footer() {
  const footerLinks = {
    Productos: [
      { label: "Smartphones", href: "/categories/smartphones" },
      { label: "Laptops", href: "/categories/laptops" },
      { label: "Tablets", href: "/categories/tablets" },
      { label: "Audio", href: "/categories/audio" },
      { label: "Wearables", href: "/categories/wearables" },
    ],
    "Sobre Nosotros": [
      { label: "Nuestra Historia", href: "/about" },
      { label: "Trabaja con Nosotros", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Sostenibilidad", href: "/sustainability" },
      { label: "Prensa", href: "/press" },
    ],
    Ayuda: [
      { label: "Centro de Ayuda", href: "/help" },
      { label: "Estado del Pedido", href: "/track-order" },
      { label: "Devoluciones", href: "/returns" },
      { label: "Garantías", href: "/warranty" },
      { label: "Contacto", href: "/contact" },
    ],
    Legal: [
      { label: "Términos y Condiciones", href: "/terms" },
      { label: "Política de Privacidad", href: "/privacy" },
      { label: "Política de Cookies", href: "/cookies" },
      { label: "Aviso Legal", href: "/legal" },
      { label: "Mapa del Sitio", href: "/sitemap" },
    ],
  }

  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En pedidos mayores a $500",
    },
    {
      icon: CreditCard,
      title: "Pago Seguro",
      description: "Protegido con encriptación SSL",
    },
    {
      icon: Shield,
      title: "Garantía",
      description: "30 días de devolución",
    },
    {
      icon: Headphones,
      title: "Soporte 24/7",
      description: "Asistencia técnica disponible",
    },
  ]

  return (
    <footer className="bg-background border-t text-foreground">
      {/* Features */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
           {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TechStore
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Tu destino para la última tecnología. Productos de calidad con garantía y soporte técnico.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
               <h3 className="font-semibold mb-4">{category}</h3>
               <ul className="space-y-2">
                 {links.map((link) => (
                   <li key={link.label}>
                     <Button
                       variant="link"
                       className="p-0 h-auto text-muted-foreground hover:text-foreground justify-start"
                       asChild
                     >
                       <Link href={link.href}>{link.label}</Link>
                     </Button>
                   </li>
                 ))}
               </ul>
            </div>
          ))}
        </div>

         {/* Newsletter */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Suscríbete a nuestro newsletter
              </h3>
              <p className="text-muted-foreground">
                Recibe las últimas ofertas y novedades tecnológicas
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-muted border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button className="bg-primary hover:bg-primary/90">Suscribirse</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechStore. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <img src="/placeholder-payment.png" alt="Payment methods" className="h-8" />
              <div className="text-sm text-muted-foreground">
                <span className="text-green-400">●</span> Sitio seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}