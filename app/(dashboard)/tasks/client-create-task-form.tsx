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
import { createTask } from '@/lib/actions/case-actions'

const taskTypes = [
  { value: 'research', label: 'Investigación' },
  { value: 'document', label: 'Documento' },
  { value: 'court_filing', label: 'Presentación Judicial' },
  { value: 'client_meeting', label: 'Reunión con Cliente' },
  { value: 'hearing_prep', label: 'Preparación Audiencia' },
  { value: 'deadline', label: 'Fecha Límite' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'internal', label: 'Interno' },
  { value: 'other', label: 'Otro' },
]

const priorities = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : 'Crear Tarea'}
    </Button>
  )
}

interface Case {
  id: string
  title: string
}

interface User {
  id: string
  name: string
  email: string
}

interface ClientCreateTaskFormProps {
  cases?: Case[]
  users?: User[]
}

export function ClientCreateTaskForm({ cases = [], users = [] }: ClientCreateTaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createTask(formData)
    if (result.success) {
      setSuccess(true)
      window.location.reload()
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600">Tarea creada exitosamente</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          placeholder="Ej: Revisar documentación del caso"
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
        <Label htmlFor="caseId">Caso</Label>
        <Select name="caseId" defaultValue="__none__">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar caso (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin caso asignado</SelectItem>
            {cases.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taskType">Tipo</Label>
          <Select name="taskType" defaultValue="follow_up">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select name="priority" defaultValue="normal">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Asignar a</Label>
        <Select name="assignedTo" defaultValue="__me__">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__me__">Yo mismo</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="datetime-local"
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