'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { closeCase } from '@/lib/actions/case-actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant="destructive">
      {pending ? 'Cerrando...' : 'Cerrar Caso'}
    </Button>
  )
}

export function CloseCaseButton({ caseId, caseTitle }: { caseId: string; caseTitle: string }) {
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const reason = formData.get('reason') as string
    const result = await closeCase(caseId, reason)
    if (result.success) {
      window.location.reload()
    }
  }

  if (!showConfirm) {
    return (
      <Button variant="outline" onClick={() => setShowConfirm(true)}>
        Cerrar Caso
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <p className="text-sm font-medium text-warning-800">
          ¿Estás seguro de que deseas cerrar el caso "{caseTitle}"?
        </p>
        <p className="text-sm text-warning-600 mt-1">
          Esta acción cambiará el estado a "Cerrado" y registrará la fecha de cierre.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason">Razón del cierre (opcional)</Label>
          <Textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="Describe la razón por la cual se cierra este caso..."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}