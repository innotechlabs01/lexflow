import { Settings, Shield, Database, Bell, Key, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const settingsSections = [
  {
    title: 'General',
    description: 'Configuración general de la plataforma',
    icon: Settings,
    href: '/super-admin/settings/general',
  },
  {
    title: 'Seguridad',
    description: 'Políticas de seguridad y autenticación',
    icon: Shield,
    href: '/super-admin/settings/security',
  },
  {
    title: 'Base de Datos',
    description: 'Configuración de la base de datos y migraciones',
    icon: Database,
    href: '/super-admin/settings/database',
  },
  {
    title: 'Notificaciones',
    description: 'Configuración de notificaciones globales',
    icon: Bell,
    href: '/super-admin/settings/notifications',
  },
  {
    title: 'API Keys',
    description: 'Gestión de claves de API',
    icon: Key,
    href: '/super-admin/settings/api-keys',
  },
  {
    title: 'Dominios',
    description: 'Configuración de dominios y redirects',
    icon: Globe,
    href: '/super-admin/settings/domains',
  },
]

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-500">Administra la configuración global de LexFlow</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Card key={section.title} className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>Detalles técnicos de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Versión</dt>
              <dd className="font-medium">1.0.0</dd>
            </div>
            <div>
              <dt className="text-gray-500">Entorno</dt>
              <dd className="font-medium">Producción</dd>
            </div>
            <div>
              <dt className="text-gray-500">Base de datos</dt>
              <dd className="font-medium">TursoDB (libSQL)</dd>
            </div>
            <div>
              <dt className="text-gray-500">Último deploy</dt>
              <dd className="font-medium">{new Date().toLocaleString('es-CO')}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}