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
import { createHearing } from '@/lib/actions/case-actions'

const hearingTypes = [
  { value: 'initial', label: 'Audiencia Inicial' },
  { value: 'preliminary', label: 'Audiencia Preliminar' },
  { value: 'instruction', label: 'Audiencia de Instrucción' },
  { value: 'trial', label: 'Audiencia de Juicio' },
  { value: 'appeal', label: 'Audiencia de Apelación' },
  { value: 'revision', label: 'Revisión' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'conciliation', label: 'Conciliación' },
  { value: 'other', label: 'Otra' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : 'Programar Audiencia'}
    </Button>
  )
}

export function ClientScheduleHearingForm({ caseId }: { caseId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createHearing(formData)
    if (result.success) {
      setSuccess(true)
      window.location.reload()
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600">Audiencia programada exitosamente</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="caseId" value={caseId} />
      
      <div className="space-y-2">
        <Label htmlFor="hearingType">Tipo de Audiencia *</Label>
        <Select name="hearingType" required defaultValue="preliminary">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {hearingTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hearingDate">Fecha y Hora *</Label>
        <Input
          id="hearingDate"
          name="hearingDate"
          type="datetime-local"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="court">Juzgado</Label>
        <Input
          id="court"
          name="court"
          placeholder="Ej: Juzgado Laboral del Circuito"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courtroom">Sala</Label>
        <Input
          id="courtroom"
          name="courtroom"
          placeholder="Ej: Sala 3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="judgeName">Nombre del Juez</Label>
        <Input
          id="judgeName"
          name="judgeName"
          placeholder="Nombre del juez"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          name="location"
          placeholder="Dirección o link de la audiencia virtual"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationMinutes">Duración (minutos)</Label>
        <Input
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          defaultValue="60"
          min="15"
          max="480"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Notas adicionales..."
        />
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