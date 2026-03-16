import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Shield, Zap, Globe, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted to-background py-20 px-4">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-5" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-lg py-2 px-4 border-primary/30">
              Sobre Nosotros
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Innovación que Transforma
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              En TechStore, combinamos tecnología de vanguardia con una experiencia de compra excepcional para impulsar tu potencial.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Productos Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5+</div>
              <div className="text-muted-foreground">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Soporte Técnico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">Nuestra Misión</CardTitle>
                </div>
                <CardDescription className="text-lg">
                  Democratizar el acceso a la tecnología de última generación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nos esforzamos por hacer que la tecnología más avanzada sea accesible para todos, 
                  eliminando barreras y facilitando la adopción de herramientas que potencian la creatividad, 
                  productividad y conexión humana.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/10 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-purple-500" />
                  <CardTitle className="text-2xl">Nuestra Visión</CardTitle>
                </div>
                <CardDescription className="text-lg">
                  Ser el referente global en comercio tecnológico sostenible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aspiramos a crear un ecosistema tecnológico donde la innovación, la calidad y la sostenibilidad 
                  converjan para ofrecer soluciones que no solo satisfacen necesidades actuales, sino que también 
                  moldean un futuro más conectado y eficiente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Principios que guían cada decisión y acción en TechStore
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg bg-card">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Confianza y Transparencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Operamos con total transparencia en precios, especificaciones y políticas. 
                  Cada producto está respaldado por garantías verificadas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-card">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle>Innovación Constante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mantenemos nuestro catálogo siempre actualizado con las últimas tendencias 
                  y avances tecnológicos, asegurando que tengas acceso a lo mejor.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-card">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 mb-4">
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <CardTitle>Pasión por el Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nuestro equipo está dedicado a brindar una experiencia excepcional, con soporte 
                  personalizado y soluciones adaptadas a cada necesidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nuestro Equipo</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expertos apasionados por la tecnología comprometidos con tu éxito
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center border-2 border-transparent hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Laura Martínez</h3>
                <p className="text-primary font-medium">CEO & Fundadora</p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  15+ años en retail tecnológico. Visionaria detrás de TechStore.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Carlos Rodríguez</h3>
                <p className="text-blue-500 font-medium">CTO</p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Experto en infraestructura cloud y sistemas escalables.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Ana Gómez</h3>
                <p className="text-green-500 font-medium">Directora de Compras</p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Especialista en cadena de suministro y relaciones con fabricantes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">David López</h3>
                <p className="text-orange-500 font-medium">Director de Experiencia</p>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">
                  Diseñador de experiencias centrado en la satisfacción del cliente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Únete a la Revolución Tecnológica</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Descubre cómo TechStore puede potenciar tu vida digital con las herramientas más avanzadas del mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/products">
                Explorar Catálogo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/contact">
                Contactar Equipo
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}