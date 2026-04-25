'use client'

import { useState, useEffect } from 'react'
import { Loader2, Eye, EyeOff, UserCog } from 'lucide-react'
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

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
    role: string
    organization_id: string
    status: string
  } | null
  onSuccess?: () => void
}

export function EditUserModal({ 
  open, 
  onOpenChange, 
  user,
  onSuccess 
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  })
  const [initialData, setInitialData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  })

  useEffect(() => {
    if (user && open) {
      const nameParts = user.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const newFormData = {
        email: user.email || '',
        firstName,
        lastName,
        password: '',
      }
      setFormData(newFormData)
      setInitialData({
        email: user.email || '',
        firstName,
        lastName,
      })
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) return

    try {
      const updateData: Record<string, string> = {}

      if (formData.email !== initialData.email) {
        updateData.email = formData.email
      }
      if (formData.firstName !== initialData.firstName) {
        updateData.firstName = formData.firstName
      }
      if (formData.lastName !== initialData.lastName) {
        updateData.lastName = formData.lastName
      }

      if (formData.password && formData.password.length >= 8) {
        updateData.password = formData.password
      }

      if (Object.keys(updateData).length === 0) {
        onOpenChange(false)
        onSuccess?.()
        return
      }

      const res = await fetch(`/api/super-admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      onOpenChange(false)
      setFormData({ email: '', firstName: '', lastName: '', password: '' })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            Editar Usuario
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Editar la información del usuario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstNameEdit" className="text-slate-700">Nombre</Label>
              <Input
                id="firstNameEdit"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastNameEdit" className="text-slate-700">Apellido</Label>
              <Input
                id="lastNameEdit"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailEdit" className="text-slate-700">Correo Electrónico</Label>
            <Input
              id="emailEdit"
              type="email"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordEdit" className="text-slate-700">
              Nueva Contraseña <span className="text-slate-400 text-xs">(opcional)</span>
            </Label>
            <div className="relative">
              <Input
                id="passwordEdit"
                type={showPassword ? 'text' : 'password'}
                placeholder="Dejar vacío para mantener la actual"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#004ac6] hover:bg-[#0038a3] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserCog className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}