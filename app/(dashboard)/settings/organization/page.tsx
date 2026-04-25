import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Organización</CardTitle>
          <CardDescription>Actualiza la información de tu bufete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nombre del Bufete</Label>
              <Input id="org-name" defaultValue="Sánchez & Asociados Abogados" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">URL personalizada</Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">lexflow.app/</span>
                <Input id="org-slug" defaultValue="sanchez-abogados" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address">Dirección</Label>
              <Input id="org-address" defaultValue="Calle 72 #10-34, Oficina 501" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-city">Ciudad</Label>
              <Input id="org-city" defaultValue="Bogotá" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">Teléfono</Label>
              <Input id="org-phone" defaultValue="+57 601 234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-email">Email</Label>
              <Input id="org-email" type="email" defaultValue="contacto@sanchezabogados.com" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo del Bufete</CardTitle>
          <CardDescription>Sube el logo que aparecerá en tus documentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <span className="text-gray-400">Logo</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline">Subir Logo</Button>
              <p className="text-xs text-gray-500">PNG, JPG. Máximo 500KB. Recomendado: 200x200px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
          <CardDescription>Tu suscripción y límites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Badge variant="default" className="mb-2">Pro</Badge>
                <p className="text-sm text-gray-500">
                  5 abogados • 100 clientes • 500 casos • 50 GB
                </p>
              </div>
            </div>
            <Button variant="outline">Cambiar Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger-200">
        <CardHeader>
          <CardTitle className="text-danger-600">Zona de Peligro</CardTitle>
          <CardDescription>Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Eliminar organización</p>
              <p className="text-sm text-gray-500">
                Esta acción eliminará permanentemente todos los datos de la organización.
              </p>
            </div>
            <Button variant="destructive">Eliminar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}