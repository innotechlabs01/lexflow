'use client'

import { User, Building, Users, CreditCard, Bell, Shield, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const sidebarLinks = [
  { href: '/settings', label: 'Mi Perfil', icon: User },
  { href: '/settings/organization', label: 'Organización', icon: Building },
  { href: '/settings/members', label: 'Miembros', icon: Users },
  { href: '/settings/billing', label: 'Facturación', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/settings/security', label: 'Seguridad', icon: Shield },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <Separator className="my-4" />
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 w-full">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}