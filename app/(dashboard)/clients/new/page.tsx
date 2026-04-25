'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { clientSchema, type ClientInput } from '@/lib/validations'
import { DOCUMENT_TYPE_LABELS, LAWYER_SPECIALTY_LABELS } from '@/lib/constants'
import { useState, useEffect } from 'react'

interface Lawyer {
  id: string
  name: string
  specialty: string | null
  email: string
}

export default function NewClientPage() {
  const router = useRouter()
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [selectedLawyer, setSelectedLawyer] = useState<string>('')

  useEffect(() => {
    async function loadLawyers() {
      try {
        const res = await fetch('/api/lawyers')
        const data = await res.json()
        setLawyers(data.data || [])
      } catch (err) {
        console.error('Error loading lawyers:', err)
      }
    }
    loadLawyers()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
  })

  const selectedLawyerData = lawyers.find(l => l.id === selectedLawyer)

  const onSubmit = async (data: ClientInput) => {
    try {
      const payload = {
        ...data,
        assignedLawyerId: selectedLawyer || undefined,
      }
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/clients')
      } else {
        const error = await response.json()
        console.error('Error creating client:', error)
        alert('Error al crear el cliente. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el cliente. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-500">Registra un nuevo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre completo o razón social"
              />
              {errors.name && (
                <p className="text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select
                  onValueChange={(value) => {
                    setValue('documentType', value as ClientInput['documentType'])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('documentType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número de Documento</Label>
                <Input
                  id="documentNumber"
                  {...register('documentNumber')}
                  placeholder="Número de documento"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="Departamento"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">Ocupación/Actividad</Label>
                <Input
                  id="occupation"
                  {...register('occupation')}
                  placeholder="Ocupación o actividad económica"
                />
              </div>
<div className="space-y-2">
                <Label htmlFor="referredBy">Referido por</Label>
                <Input
                  id="referredBy"
                  {...register('referredBy')}
                  placeholder="¿Quién refinó al cliente?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lawyer">Abogado Asignado</Label>
              <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLawyerData && (
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium">Especialidad: </span>
                  {LAWYER_SPECIALTY_LABELS[selectedLawyerData.specialty || 'other'] || 'No especificada'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Notas adicionales sobre el cliente..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/clients">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Cliente
          </Button>
        </div>
      </form>
    </div>
  )
}
