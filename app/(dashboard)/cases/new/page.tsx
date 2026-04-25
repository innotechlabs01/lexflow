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
import { caseSchema, type CaseInput } from '@/lib/validations'
import { CASE_TYPES, CASE_PRIORITIES } from '@/lib/constants'
import { useEffect, useState } from 'react'

interface Client {
  id: string
  userName: string | null
  userEmail: string | null
}

interface Lawyer {
  id: string
  name: string
  email: string
}

export default function NewCasePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaseInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: 'open',
      priority: 'normal',
      currency: 'COP',
      tags: [],
    },
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, lawyersRes] = await Promise.all([
          fetch('/api/clients?limit=100'),
          fetch('/api/lawyers'),
        ])

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData.data || [])
        }

        if (lawyersRes.ok) {
          const lawyersData = await lawyersRes.json()
          console.log('Lawyers data:', lawyersData)
          setLawyers(lawyersData.data || [])
        } else {
          console.error('Lawyers API error:', lawyersRes.status, await lawyersRes.text())
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const onSubmit = async (data: CaseInput) => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/cases')
      } else {
        const error = await response.json()
        console.error('Error creating case:', error)
        alert('Error al crear el caso. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el caso. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso</h1>
          <p className="text-gray-500">Registra un nuevo caso legal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Caso *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Demanda Laboral - Juan Pérez"
              />
              {errors.title && (
                <p className="text-sm text-danger-600">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Número de Caso</Label>
                <Input
                  id="caseNumber"
                  {...register('caseNumber')}
                  placeholder="Ej: 2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalCode">Código Interno</Label>
                <Input
                  id="internalCode"
                  {...register('internalCode')}
                  placeholder="Código de referencia interno"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseType">Tipo de Caso</Label>
                <Select onValueChange={(value) => setValue('caseType', value as CaseInput['caseType'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CASE_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  defaultValue="normal"
                  onValueChange={(value) => setValue('priority', value as CaseInput['priority'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CASE_PRIORITIES).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del caso..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Judicial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="court">Juzgado/Tribunal</Label>
                <Input
                  id="court"
                  {...register('court')}
                  placeholder="Ej: Juzgado Laboral del Circuito"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judge">Juez</Label>
                <Input
                  id="judge"
                  {...register('judge')}
                  placeholder="Nombre del juez"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="radicado">Radicado Rama Judicial</Label>
                <Input
                  id="radicado"
                  {...register('radicado')}
                  placeholder="Número de radicado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountInDispute">Monto en Disputa</Label>
                <Input
                  id="amountInDispute"
                  type="number"
                  {...register('amountInDispute', { valueAsNumber: true })}
                  placeholder="Valor en disputa"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente y Abogado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select onValueChange={(value) => setValue('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : clients.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    ) : (
                      clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.userName || client.name || 'Sin nombre'} ({client.userEmail || client.email || 'Sin email'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lawyerId">Abogado Asignado</Label>
                <Select onValueChange={(value) => setValue('lawyerId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar abogado" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : lawyers.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay abogados disponibles
                      </SelectItem>
                    ) : (
                      lawyers.map((lawyer: any) => (
                        <SelectItem key={lawyer.id} value={lawyer.id}>
                          {lawyer.name || 'Sin nombre'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/cases">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Caso
          </Button>
        </div>
      </form>
    </div>
  )
}
