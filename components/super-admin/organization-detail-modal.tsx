'use client'

import * as React from 'react'
import { 
  Building2, 
  Users, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OrganizationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    status: string
    logoUrl: string | null
    settings: Record<string, unknown>
    // Business/organizational details
    industry?: string
    employeeCount?: number
    address?: string
    city?: string
    country?: string
    contactEmail?: string
    contactPhone?: string
    website?: string
    // Stats
    userCount: number
    clientCount: number
    caseCount: number
    createdAt: number
    updatedAt: number
  }
  onEdit?: (orgId: string) => void
  onDelete?: (orgId: string) => void
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspendido', color: 'bg-red-100 text-red-700' },
}

const planConfig: Record<string, { label: string; badge: 'default' | 'secondary' | 'outline' }> = {
  free: { label: 'Free', badge: 'outline' },
  pro: { label: 'Pro', badge: 'secondary' },
  enterprise: { label: 'Enterprise', badge: 'default' },
}

export function OrganizationDetailModal({ 
  open, 
  onOpenChange,
  organization,
  onEdit,
  onDelete
}: OrganizationDetailModalProps) {
  if (!organization) {
    return null
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {organization.name || 'Sin nombre'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500">
            {organization.slug || 'Sin slug'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Industria</p>
                  <p className="text-gray-700">{organization.industry}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Tamaño</p>
                  <p className="text-gray-700">{organization.employeeCount} empleados</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Ubicación</p>
                  <p className="text-gray-700">
                    {organization.address}, {organization.city}, {organization.country}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Email de Contacto</p>
                  <a href={`mailto:${organization.contactEmail}`} className="text-primary hover:underline">
                    {organization.contactEmail}
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-gray-700">{organization.contactPhone}</p>
                </div>
                {organization.website && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {organization.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan y Estado */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Plan y Estado</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan</p>
                  <Badge variant={planConfig[organization.plan]?.badge || 'outline'}>
                    {planConfig[organization.plan]?.label || organization.plan}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[organization.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${organization.status === 'active' ? 'bg-emerald-500' : organization.status === 'trial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    {statusConfig[organization.status]?.label || organization.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-primary-50 rounded-lg">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary-900">{organization.userCount}</p>
                <p className="text-sm text-primary-700">Usuarios</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{organization.clientCount}</p>
                <p className="text-sm text-blue-700">Clientes</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">{organization.caseCount}</p>
                <p className="text-sm text-orange-700">Casos</p>
              </div>
            </CardContent>
          </Card>

            {/* Fechas importantes */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Fechas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                  <p className="text-gray-700">
                    {new Date(Number(organization.createdAt) * 1000).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>

         <DialogFooter className="gap-2">
           <Button
             type="button"
             variant="outline"
             onClick={() => onOpenChange(false)}
           >
             Cerrar
           </Button>
           {onEdit && (
             <Button
               type="button"
               variant="ghost"
               onClick={() => {
                 onOpenChange(false)
                 onEdit?.(organization.id)
               }}
             >
               <Edit className="mr-2 h-4 w-4" />
               Editar
             </Button>
           )}
           {onDelete && (
             <Button
               type="button"
               variant="destructive"
               onClick={() => {
                 // Show confirmation dialog or directly call delete
                 if (window.confirm(`¿Estás seguro de que deseas eliminar la organización "${organization.name}"? Esta acción no se puede deshacer.`)) {
                   onOpenChange(false)
                   onDelete?.(organization.id)
                 }
               }}
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Eliminar
             </Button>
           )}
         </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}