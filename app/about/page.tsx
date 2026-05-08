import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Shield, Zap, Globe, Heart, Play, User, Cpu, ShoppingCart, Smile } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 circuit-pattern-intense animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="text-lg py-2 px-6 border-primary/50 glow-primary">
              Sobre Nosotros
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Innovación que Transforma
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              En TechStore, combinamos tecnología de vanguardia con una experiencia de compra excepcional para impulsar tu potencial.
            </p>
            <div className="pt-4">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 transition-smooth">
                <Play className="mr-2 h-5 w-5" />
                Ver nuestro video
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30 animate-fade-in-up animate-delay-100">
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
      <section className="py-20 px-4 animate-fade-in-up animate-delay-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
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

            <Card className="border-2 border-accent/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary" />
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <Globe className="h-6 w-6 text-accent" />
                  </div>
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
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30 animate-fade-in-up animate-delay-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="text-lg py-2 px-6 border-primary/50 glow-primary mb-6">
              Nuestros Valores
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Principios Fundamentales</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Los valores que guían cada decisión y acción en TechStore, asegurando excelencia en cada interacción
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="text-center border-2 border-primary/10 shadow-xl hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="pt-10 pb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 mx-auto group-hover:scale-110 transition-smooth">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Confianza y Transparencia</CardTitle>
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <p className="text-muted-foreground text-lg">
                  Operamos con total transparencia en precios, especificaciones y políticas. 
                  Cada producto está respaldado por garantías verificadas y evaluaciones honestas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-secondary/10 shadow-xl hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-br from-secondary/5 to-primary/5 hover:from-secondary/10 hover:to-primary/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-primary" />
              <CardHeader className="pt-10 pb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 mb-6 mx-auto group-hover:scale-110 transition-smooth">
                  <Zap className="h-12 w-12 text-secondary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Innovación Constante</CardTitle>
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <p className="text-muted-foreground text-lg">
                  Mantenemos nuestro catálogo siempre actualizado con las últimas tendencias 
                  y avances tecnológicos, asegurando que tengas acceso a lo mejor del mercado.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-accent/10 shadow-xl hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-br from-accent/5 to-secondary/5 hover:from-accent/10 hover:to-secondary/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent to-secondary" />
              <CardHeader className="pt-10 pb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 mb-6 mx-auto group-hover:scale-110 transition-smooth">
                  <Heart className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Pasión por el Servicio</CardTitle>
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <p className="text-muted-foreground text-lg">
                  Nuestro equipo está dedicado a brindar una experiencia excepcional, con soporte 
                  personalizado y soluciones adaptadas a cada necesidad específica.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/10 to-background animate-fade-in-up animate-delay-400">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="text-lg py-2 px-6 border-accent/50 glow-accent mb-6">
              Nuestro Equipo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Expertos en Tecnología</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Un equipo apasionado por la innovación, comprometido con brindarte la mejor experiencia tecnológica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 border-primary/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-b from-primary/5 to-transparent hover:from-primary/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="pt-12 pb-8 px-6">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-smooth">
                  <User className="h-20 w-20 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-1">Laura Martínez</h3>
                <p className="text-primary font-medium text-lg mb-4">CEO & Fundadora</p>
                <Separator className="my-4 border-primary/20" />
                <p className="text-muted-foreground">
                  15+ años en retail tecnológico. Visionaria detrás de TechStore y líder en innovación.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-secondary/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-b from-secondary/5 to-transparent hover:from-secondary/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-primary" />
              <CardContent className="pt-12 pb-8 px-6">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-smooth">
                  <Cpu className="h-20 w-20 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-1">Carlos Rodríguez</h3>
                <p className="text-secondary font-medium text-lg mb-4">CTO</p>
                <Separator className="my-4 border-secondary/20" />
                <p className="text-muted-foreground">
                  Experto en infraestructura cloud, sistemas escalables y arquitectura de vanguardia.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-accent/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-b from-accent/5 to-transparent hover:from-accent/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent to-secondary" />
              <CardContent className="pt-12 pb-8 px-6">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-smooth">
                  <ShoppingCart className="h-20 w-20 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-1">Ana Gómez</h3>
                <p className="text-accent font-medium text-lg mb-4">Directora de Compras</p>
                <Separator className="my-4 border-accent/20" />
                <p className="text-muted-foreground">
                  Especialista en cadena de suministro global y relaciones estratégicas con fabricantes líderes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-primary/10 shadow-lg hover:shadow-2xl hover-lift transition-smooth overflow-hidden group bg-gradient-to-b from-primary/5 to-transparent hover:from-primary/10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="pt-12 pb-8 px-6">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-smooth">
                  <Smile className="h-20 w-20 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-1">David López</h3>
                <p className="text-primary font-medium text-lg mb-4">Director de Experiencia</p>
                <Separator className="my-4 border-primary/20" />
                <p className="text-muted-foreground">
                  Diseñador de experiencias centrado en la satisfacción del cliente y la usabilidad avanzada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-fade-in-up animate-delay-500">
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