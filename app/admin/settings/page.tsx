"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, Shield, Bell, Globe, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Configuración general del panel de administración
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Configuración del Sistema</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Esta sección está en desarrollo. Pronto podrás configurar todas las opciones del panel de administración desde aquí.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button asChild>
                    <a href="/admin">
                      Volver al Dashboard
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Globe className="h-4 w-4 mr-2" />
                  General
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Seguridad
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  Permisos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Versión del Panel</p>
                    <p className="text-2xl font-bold">1.0.0</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <p className="text-2xl font-bold">Activo</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}