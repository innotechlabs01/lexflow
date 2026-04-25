'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCaseEvent } from '@/lib/actions/case-actions'

const eventTypes = [
  { value: 'procedural', label: 'Procedimental' },
  { value: 'document', label: 'Documento' },
  { value: 'hearing', label: 'Audiencia' },
  { value: 'communication', label: 'Comunicación' },
  { value: 'internal_note', label: 'Nota Interna' },
  { value: 'status_change', label: 'Cambio de Estado' },
  { value: 'task', label: 'Tarea' },
  { value: 'notification', label: 'Notificación' },
  { value: 'external_sync', label: 'Sincronización Externa' },
]

const visibilityOptions = [
  { value: 'internal', label: 'Interno' },
  { value: 'client_visible', label: 'Visible para Cliente' },
  { value: 'public', label: 'Público' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : 'Agregar Evento'}
    </Button>
  )
}

export function ClientAddEventForm({ caseId }: { caseId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createCaseEvent(formData)
    if (result.success) {
      setSuccess(true)
      window.location.reload()
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600">Evento agregado exitosamente</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="caseId" value={caseId} />
      
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          placeholder="Ej: Radicación de Demanda"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventType">Tipo de Evento *</Label>
        <Select name="eventType" required defaultValue="procedural">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDate">Fecha del Evento *</Label>
        <Input
          id="eventDate"
          name="eventDate"
          type="datetime-local"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Agrega detalles adicionales..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibilidad</Label>
        <Select name="visibility" defaultValue="internal">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar visibilidad" />
          </SelectTrigger>
          <SelectContent>
            {visibilityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}