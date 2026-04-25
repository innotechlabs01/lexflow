'use client'

import { useState, useEffect, useMemo } from 'react'
import { Mail, Loader2, Eye, EyeOff, Search, X, Building2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LAWYER_SPECIALTY_LABELS } from '@/lib/constants'

const ORG_ROLE_MAP: Record<string, string> = {
  'org_3CaNL16xpYxSsuof7IUzeJkZ3rm': 'super_admin',
  'org_3CaNM6MgMGfdwgJMn3u6MNNS25X': 'admin',
  'org_3ConOXCmejDrJkl2VkrD2JdNYHh': 'lawyer',
  'org_3CqeyRSU37Kg5zUwTzPVTl6ONre': 'client',
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  lawyer: 'Abogado',
  client: 'Cliente',
}

interface Organization {
  id: string
  name: string
  employeeCount: number
}

interface MemberInviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  currentOrganizationId?: string
  currentOrganizationName?: string
}

export function MemberInviteModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  currentOrganizationId,
  currentOrganizationName
}: MemberInviteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgSearch, setOrgSearch] = useState(currentOrganizationName || '')
  const [showOrgDropdown, setShowOrgDropdown] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    organizationId: '',
    specialty: '',
    role: 'lawyer',
  })

  useEffect(() => {
    if (formData.organizationId) {
      const role = ORG_ROLE_MAP[formData.organizationId] || 'lawyer'
      setFormData(prev => ({ ...prev, role }))
    }
  }, [formData.organizationId])

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch('/api/super-admin/stats')
        const data = await res.json()
        setOrganizations(data.organizations || [])
      } catch (err) {
        console.error('Error loading organizations:', err)
      }
    }
    if (open) loadOrgs()
  }, [open])

  const filteredOrgs = useMemo(() => {
    if (!orgSearch) return organizations
    const search = orgSearch.toLowerCase()
    return organizations.filter(org => 
      org.name.toLowerCase().includes(search)
    )
  }, [organizations, orgSearch])

  const selectedOrg = organizations.find(o => o.id === formData.organizationId)
  const maxUsers = selectedOrg?.employeeCount || 10
  const isOrgSelected = formData.organizationId !== ''
  const remainingSlots = isOrgSelected ? maxUsers : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.password || formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    if (!formData.organizationId) {
      setError('Debes seleccionar una organización')
      setLoading(false)
      return
    }

    try {
      console.log('[DEBUG] Enviando datos:', { ...formData, role: ORG_ROLE_MAP[formData.organizationId] || formData.role })
      
      const res = await fetch('/api/super-admin/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: ORG_ROLE_MAP[formData.organizationId] || formData.role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      onOpenChange(false)
      setFormData({ 
        email: '', 
        firstName: '', 
        lastName: '', 
        password: '', 
        organizationId: '',
        specialty: '',
        role: 'lawyer',
      })
      setOrgSearch('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectOrg = (org: Organization) => {
    const role = ORG_ROLE_MAP[org.id] || 'lawyer'
    setFormData({ ...formData, organizationId: org.id, role })
    setOrgSearch(org.name)
    setShowOrgDropdown(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            Invitar Miembro
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Invitar a un abogado a tu organización
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-700">Organización</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar organización..."
                  value={orgSearch}
                  onChange={(e) => {
                    setOrgSearch(e.target.value)
                    setShowOrgDropdown(true)
                    if (!e.target.value) {
                      setFormData({ ...formData, organizationId: '' })
                    }
                  }}
                  onFocus={() => setShowOrgDropdown(true)}
                  className="pl-10 pr-10 border-slate-300"
                />
                {orgSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrgSearch('')
                      setFormData({ ...formData, organizationId: '' })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {showOrgDropdown && filteredOrgs.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredOrgs.map((org: Organization) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => selectOrg(org)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-slate-900">{org.name}</p>
                        <p className="text-xs text-gray-500">{org.employeeCount} usuarios permitidos</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isOrgSelected && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  {remainingSlots} espacios disponibles de {maxUsers}
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Rol: {ROLE_LABELS[formData.role] || formData.role}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700">Nombre</Label>
              <Input
                id="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700">Apellido</Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="pr-10 border-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-slate-700">Especialidad</Label>
            <Select
              value={formData.specialty}
              onValueChange={(value) => setFormData({ ...formData, specialty: value })}
            >
              <SelectTrigger className="border-slate-300">
                <SelectValue placeholder="Seleccionar especialidad" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LAWYER_SPECIALTY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setOrgSearch('')
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !isOrgSelected}
              className="bg-[#004ac6] hover:bg-[#0038a3] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Invitar Miembro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}