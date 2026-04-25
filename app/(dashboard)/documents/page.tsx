import { Plus, Search, Filter, FileText, Download, Eye, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { getAuthContext } from '@/lib/auth/middleware'
import { getDocuments, formatFileSize } from '@/lib/data/documents'
import { redirect } from 'next/navigation'

const documentTypeConfig: Record<string, { label: string; color: string }> = {
  contract: { label: 'Contrato', color: 'bg-primary-100 text-primary-700' },
  petition: { label: 'Demanda', color: 'bg-warning-100 text-warning-700' },
  evidence: { label: 'Prueba', color: 'bg-success-100 text-success-700' },
  motion: { label: 'Escrito', color: 'bg-purple-100 text-purple-700' },
  ruling: { label: 'Sentencia', color: 'bg-danger-100 text-danger-700' },
  correspondence: { label: 'Correspondencia', color: 'bg-gray-100 text-gray-700' },
  power_of_attorney: { label: 'Poder', color: 'bg-cyan-100 text-cyan-700' },
  id_document: { label: 'Identificación', color: 'bg-gray-100 text-gray-700' },
  other: { label: 'Otro', color: 'bg-gray-100 text-gray-700' },
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export default async function DocumentsPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const { documents: documentsList, total, totalSize, byType } = await getDocuments(ctx, { limit: 100 })

  const confidentialCount = documentsList.filter((d) => d.isConfidential).length
  const thisMonthCount = documentsList.filter((d) => {
    if (!d.createdAt) return false
    const now = new Date()
    const docDate = new Date(d.createdAt)
    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-500">
            Gestiona todos tus documentos legales
            {total > 0 && <span className="ml-2 text-gray-400">({total} en total)</span>}
          </p>
        </div>
        {(ctx.isAdmin || ctx.isLawyer) && (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Subir Documento
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar documentos..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <FileText className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
                <p className="text-sm text-gray-500">Almacenamiento usado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <FileText className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{thisMonthCount}</p>
                <p className="text-sm text-gray-500">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-100 rounded-lg">
                <FileText className="h-5 w-5 text-danger-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{confidentialCount}</p>
                <p className="text-sm text-gray-500">Confidenciales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {documentsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hay documentos registrados.</p>
          <p className="text-sm text-gray-400">Sube tu primer documento para comenzar.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Caso</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Subido por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsList.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.isConfidential && (
                          <Badge variant="secondary" className="text-xs mt-1">Confidencial</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${documentTypeConfig[doc.documentType || 'other']?.color || 'bg-gray-100 text-gray-700'}`}>
                      {documentTypeConfig[doc.documentType || 'other']?.label || 'Otro'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {doc.case?.title || '-'}
                  </TableCell>
                  <TableCell>
                    {doc.fileSize ? formatFileSize(doc.fileSize) : '-'}
                  </TableCell>
                  <TableCell>
                    {doc.uploader?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {formatDate(doc.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      {(ctx.isAdmin || ctx.isLawyer) && (
                        <Button variant="ghost" size="icon" className="text-danger-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
