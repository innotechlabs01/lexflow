'use client'

import * as React from 'react'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  MapPin,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface CreateOrganizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (org: {
    id: string
    name: string
    slug: string
    plan: string
    status: string
    logoUrl: string | null
    settings: Record<string, unknown>
    industry?: string
    employeeCount?: number
    address?: string
    city?: string
    country?: string
    contactEmail?: string
    contactPhone?: string
    website?: string
    createdAt: number
    updatedAt: number
    userCount: number
    clientCount: number
    caseCount: number
  }) => void
}

interface FormData {
  name: string
  slug: string
  plan: string
  contactEmail: string
  contactPhone: string
  website: string
  industry: string
  employeeCount: string
  address: string
  city: string
  country: string
}

const planFeatures = {
  free: {
    users: '1 usuario',
    clients: '10 clientes',
    cases: '20 casos',
    storage: '1 GB',
  },
  pro: {
    users: '5 usuarios',
    clients: '100 clientes',
    cases: '500 casos',
    storage: '50 GB',
  },
  enterprise: {
    users: 'Ilimitado',
    clients: 'Ilimitado',
    cases: 'Ilimitado',
    storage: '500 GB',
  },
}

export function CreateOrganizationModal({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateOrganizationModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    slug: '',
    plan: 'pro',
    contactEmail: '',
    contactPhone: '',
    website: '',
    industry: '',
    employeeCount: '',
    address: '',
    city: '',
    country: '',
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear organización')
      }

      const org = await response.json()
      onSuccess?.(org)
      onOpenChange(false)
      setFormData({
        name: '',
        slug: '',
        plan: 'pro',
        contactEmail: '',
        contactPhone: '',
        website: '',
        industry: '',
        employeeCount: '',
        address: '',
        city: '',
        country: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
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
              Nueva Organización
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500">
            Crea un nuevo bufete o departamento. Plan seleccionado: {' '}
            <span className="font-medium text-primary capitalize">{formData.plan}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre del Bufete <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Rodríguez & Asociados"
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                URL del Portal
              </Label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">
                  lexflow.com/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  className="border-l-0 rounded-l-none focus:border-primary focus:ring-primary"
                  placeholder="nombre"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Plan <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.plan} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
              >
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Pro</span>
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Incluye en {formData.plan}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(planFeatures[formData.plan as keyof typeof planFeatures]).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-600 capitalize">{key}: <strong>{value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                  Email de Contacto
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contacto@bufete.com"
                    className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+57 300 123 4567"
                    className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                Sitio Web (opcional)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://bufete.com"
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                Industria
              </Label>
              <Select 
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Legal / Abogacía</SelectItem>
                  <SelectItem value="consulting">Consultoría</SelectItem>
                  <SelectItem value="finance">Finanzas</SelectItem>
                  <SelectItem value="healthcare">Salud</SelectItem>
                  <SelectItem value="technology">Tecnología</SelectItem>
                  <SelectItem value="education">Educación</SelectItem>
                  <SelectItem value="real-estate">Inmobiliaria</SelectItem>
                  <SelectItem value="manufacturing">Manufactura</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="text-sm font-medium text-gray-700">
                Número de Empleados
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="employeeCount"
                  type="number"
                  min="0"
                  value={formData.employeeCount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || (parseInt(value) >= 0)) {
                      setFormData(prev => ({ ...prev, employeeCount: value }))
                    }
                  }}
                  placeholder="Ej: 25"
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Dirección
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle Principal 123"
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                Ciudad
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ciudad"
                  className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                País
              </Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="border-gray-200 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colombia">Colombia</SelectItem>
                  <SelectItem value="mexico">México</SelectItem>
                  <SelectItem value="argentina">Argentina</SelectItem>
                  <SelectItem value="chile">Chile</SelectItem>
                  <SelectItem value="peru">Perú</SelectItem>
                  <SelectItem value="venezuela">Venezuela</SelectItem>
                  <SelectItem value="ecuador">Ecuador</SelectItem>
                  <SelectItem value="usa">Estados Unidos</SelectItem>
                  <SelectItem value="canada">Canadá</SelectItem>
                  <SelectItem value="spain">España</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-700 text-primary-foreground gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Crear Organización
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}