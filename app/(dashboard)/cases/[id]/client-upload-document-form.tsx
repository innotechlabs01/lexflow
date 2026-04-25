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
import { Switch } from '@/components/ui/switch'
import { uploadDocument } from '@/lib/actions/case-actions'
import { Upload } from 'lucide-react'

const documentTypes = [
  { value: 'contract', label: 'Contrato' },
  { value: 'petition', label: 'Petición/Demanda' },
  { value: 'evidence', label: 'Evidencia' },
  { value: 'motion', label: 'Moción' },
  { value: 'ruling', label: 'Resolución/Auto' },
  { value: 'correspondence', label: 'Correspondencia' },
  { value: 'power_of_attorney', label: 'Poder Notarial' },
  { value: 'id_document', label: 'Documento de Identidad' },
  { value: 'proof_of_address', label: 'Comprobante de Domicilio' },
  { value: 'financial_statement', label: 'Estados Financieros' },
  { value: 'other', label: 'Otro' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Subiendo...' : 'Subir Documento'}
    </Button>
  )
}

export function ClientUploadDocumentForm({ caseId }: { caseId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isConfidential, setIsConfidential] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    try {
      const result = await uploadDocument(caseId, {
        name: file.name,
        filePath: `cases/${caseId}/${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        documentType: formData.get('documentType') as string || undefined,
        description: formData.get('description') as string || undefined,
        isConfidential,
      })
      
      if (result.success) {
        setSuccess(true)
        window.location.reload()
      }
    } catch (err) {
      setError('Error al subir el documento')
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600">Documento subido exitosamente</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Archivo *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label htmlFor="file" className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {file ? file.name : 'Arrastra un archivo o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, JPG, PNG (max. 10MB)
            </p>
          </label>
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentType">Tipo de Documento</Label>
        <Select name="documentType" defaultValue="other">
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Descripción del documento..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isConfidential">Documento Confidencial</Label>
          <p className="text-sm text-gray-500">Restringir acceso a este documento</p>
        </div>
        <Switch
          id="isConfidential"
          checked={isConfidential}
          onCheckedChange={setIsConfidential}
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