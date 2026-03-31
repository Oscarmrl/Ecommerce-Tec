"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Headphones,
  MessageCircle,
  MailCheck,
  Shield,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simular envío de formulario
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular éxito
    setSubmitStatus("success");
    setIsSubmitting(false);

    // Resetear formulario después de éxito
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    // Mantener mensaje de éxito por 5 segundos
    setTimeout(() => {
      setSubmitStatus("idle");
    }, 5000);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "soporte@techstore.com",
      subtitle: "Respuesta en menos de 24 horas",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Teléfono",
      details: "+1 (555) 123-4567",
      subtitle: "Lunes a Viernes 9:00 - 18:00",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Oficina Central",
      details: "Av. Tecnología 1234",
      subtitle: "Silicon Valley, CA 94000",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Horario de Atención",
      details: "24/7 Soporte Técnico",
      subtitle: "Chat en vivo disponible",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const supportChannels = [
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Soporte Técnico",
      description: "Asistencia especializada para productos y dispositivos",
      responseTime: "Respuesta en 1 hora",
      available: "24/7",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Chat en Vivo",
      description: "Conversación instantánea con nuestro equipo",
      responseTime: "Respuesta inmediata",
      available: "9:00 - 21:00",
    },
    {
      icon: <MailCheck className="h-8 w-8" />,
      title: "Email Corporativo",
      description: "Consultas comerciales y alianzas estratégicas",
      responseTime: "24 horas hábiles",
      available: "Lunes a Viernes",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Garantías y Devoluciones",
      description: "Procesamiento de garantías y políticas de devolución",
      responseTime: "48 horas hábiles",
      available: "Lunes a Viernes",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 dark:via-blue-950/20 to-background py-20 px-4">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-5" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <Badge
              variant="outline"
              className="text-lg py-2 px-4 border-blue-500/30"
            >
              Contáctanos
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              Estamos para Ayudarte
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Tu satisfacción es nuestra prioridad. Conéctate con nuestro equipo
              de expertos y encuentra soluciones personalizadas.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="border-2 border-transparent hover:border-blue-500/20 transition-all hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${info.bgColor} ${info.color} mb-4`}
                  >
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{info.title}</h3>
                  <p className="text-foreground font-medium mb-1">
                    {info.details}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {info.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-2 border-blue-500/10 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-2xl">
                    Envíanos un Mensaje
                  </CardTitle>
                </div>
                <CardDescription>
                  Completa el formulario y nuestro equipo se pondrá en contacto
                  contigo lo antes posible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus === "success" && (
                  <Alert className="mb-6 border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      ¡Mensaje enviado con éxito! Nos pondremos en contacto
                      contigo pronto.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hubo un error al enviar el mensaje. Por favor, inténtalo
                      de nuevo.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="¿Cómo podemos ayudarte?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe tu consulta o requerimiento..."
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support Channels & FAQ */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Canales de Soporte</h2>
                <div className="space-y-4">
                  {supportChannels.map((channel, index) => (
                    <Card
                      key={index}
                      className="border hover:border-blue-500/30 transition-colors"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500">
                            {channel.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold">
                                {channel.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {channel.available}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 mb-2">
                              {channel.description}
                            </p>
                            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {channel.responseTime}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Preguntas Frecuentes
                </h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold mb-2">
                        ¿Cuál es el tiempo de envío?
                      </h3>
                      <p className="text-muted-foreground">
                        Los envíos estándar toman 3-5 días hábiles. Contamos con
                        opción de envío express (24-48 horas) disponible.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold mb-2">
                        ¿Cómo puedo hacer seguimiento a mi pedido?
                      </h3>
                      <p className="text-muted-foreground">
                        Recibirás un email con el código de seguimiento. También
                        puedes consultar el estado en tu cuenta o contactando a
                        soporte.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold mb-2">
                        ¿Qué cubre la garantía de 2 años?
                      </h3>
                      <p className="text-muted-foreground">
                        Cubre defectos de fabricación y fallas técnicas. No
                        cubre daños por mal uso, caídas o exposición a líquidos.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Location */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Visita Nuestra Oficina</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos ubicados en el corazón del distrito tecnológico, listos
              para atenderte personalmente.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-2 border-blue-500/10 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Ubicación en el Mapa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Mapa placeholder */}
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  {/* MAPA */}
                  <iframe
                    src="https://www.google.com/maps?q=Silicon+Valley+California&output=embed"
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                  />

                  {/* OVERLAY SOLO DARK */}
                  <div className="absolute inset-0 invisible dark:visible bg-gradient-to-br dark:from-blue-950/70 dark:to-cyan-950/70"></div>

                  {/* CONTENIDO */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 rounded-xl dark:backdrop-blur-sm">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                        <MapPin className="h-8 w-8" />
                      </div>

                      <h3 className="text-xl font-bold mb-2">
                        Silicon Valley Office
                      </h3>

                      <p className="mb-4">
                        Av. Tecnología 1234, Silicon Valley <br />
                        California 94000, Estados Unidos
                      </p>

                      <a
                        href="https://www.google.com/maps?q=Silicon+Valley+California"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          Abrir en Google Maps
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Horarios de Atención Presencial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Lunes - Viernes</span>
                    <span className="font-bold">9:00 - 18:00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Sábados</span>
                    <span className="font-bold">10:00 - 14:00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Domingos</span>
                    <span className="font-bold text-muted-foreground">
                      Cerrado
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Servicios en Oficina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Demostración de productos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Asesoría técnica personalizada
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recogida de garantías
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Eventos y talleres
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">
                      ¿Necesitas ayuda urgente?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nuestro equipo de soporte técnico está disponible 24/7
                      para emergencias técnicas.
                    </p>
                    <Button className="w-full" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar Soporte de Emergencia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
