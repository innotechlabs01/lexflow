import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Edit, FileText, Calendar, User, Upload, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timeline } from '@/components/ui/timeline'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import Link from 'next/link'
import { getCaseById, getCaseEvents, getCaseHearings } from '@/lib/data/cases'
import { getDocuments, formatFileSize } from '@/lib/data/documents'
import { getAuthContext } from '@/lib/auth/middleware'
import { createCaseEvent, createHearing, uploadDocument } from '@/lib/actions/case-actions'
import { ClientAddEventForm } from './client-add-event-form'
import { ClientScheduleHearingForm } from './client-schedule-hearing-form'
import { ClientUploadDocumentForm } from './client-upload-document-form'
import { CloseCaseButton } from './close-case-button'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'danger' }> = {
  open: { label: 'Abierto', variant: 'secondary' },
  in_progress: { label: 'En Progreso', variant: 'success' },
  hearing: { label: 'Audiencia', variant: 'warning' },
  appeal: { label: 'Apelación', variant: 'default' },
  closed: { label: 'Cerrado', variant: 'secondary' },
}

const priorityConfig: Record<string, { label: string; variant: 'danger' | 'warning' | 'secondary' }> = {
  urgent: { label: 'Urgente', variant: 'danger' },
  high: { label: 'Alta', variant: 'warning' },
  normal: { label: 'Normal', variant: 'secondary' },
  low: { label: 'Baja', variant: 'secondary' },
}

const typeConfig: Record<string, string> = {
  labor: 'Laboral',
  civil: 'Civil',
  criminal: 'Penal',
  family: 'Familia',
  administrative: 'Administrativo',
}

const documentTypeLabels: Record<string, string> = {
  contract: 'Contrato',
  petition: 'Petición',
  evidence: 'Evidencia',
  motion: 'Moción',
  ruling: 'Resolución',
  correspondence: 'Correspondencia',
  power_of_attorney: 'Poder Notarial',
  id_document: 'Documento de Identidad',
  proof_of_address: 'Comprobante de Domicilio',
  financial_statement: 'Estados Financieros',
  other: 'Otro',
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const ctx = await getAuthContext()
  
  if (!ctx) {
    redirect('/sign-in')
  }

  const caseItem = await getCaseById(ctx, id)

  if (!caseItem) {
    notFound()
  }

  const [events, hearings, documentsResult] = await Promise.all([
    getCaseEvents(ctx, id),
    getCaseHearings(ctx, id),
    getDocuments(ctx, { filters: { caseId: id } }),
  ])

  const status = statusConfig[caseItem.status] || statusConfig.open
  const priority = priorityConfig[caseItem.priority] || priorityConfig.normal
  const caseType = caseItem.caseType ? typeConfig[caseItem.caseType] : 'General'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/cases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{caseItem.title}</h1>
            <div className="flex items-center gap-3">
              {caseItem.caseNumber && <span className="text-gray-500">{caseItem.caseNumber}</span>}
              {caseItem.internalCode && <span className="text-gray-500">{caseItem.internalCode}</span>}
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant={priority.variant}>{priority.label}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/cases/${caseItem.id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Caso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Caso</p>
                <p className="text-gray-900">{caseType}</p>
              </div>
              {caseItem.radicado && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Radicado</p>
                  <p className="text-gray-900 font-mono">{caseItem.radicado}</p>
                </div>
              )}
              {caseItem._count && (
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Eventos</p>
                    <p className="text-gray-900">{caseItem._count.events}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Audiencias</p>
                    <p className="text-gray-900">{caseItem._count.hearings}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tareas</p>
                    <p className="text-gray-900">{caseItem._count.tasks}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Timeline del Caso</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Agregar Evento</DialogTitle>
                    <DialogDescription>
                      Registra un nuevo evento en la línea de tiempo del caso
                    </DialogDescription>
                  </DialogHeader>
                  <ClientAddEventForm caseId={id} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <Timeline
                  events={events.map((event: typeof events[number]) => ({
                    id: event.id,
                    type: event.eventType as 'procedural' | 'document' | 'hearing' | 'communication' | 'internal_note' | 'status_change' | 'task' | 'external_sync',
                    title: event.title,
                    description: event.description || undefined,
                    date: event.eventDate.toISOString(),
                    source: event.source as 'manual' | 'rama_judicial' | 'email' | 'system',
                  }))}
                  showSource
                />
              ) : (
                <p className="text-gray-500 text-sm">No hay eventos registrados</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Audiencias</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Programar Audiencia
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Programar Audiencia</DialogTitle>
                    <DialogDescription>
                      Agenda una nueva audiencia para este caso
                    </DialogDescription>
                  </DialogHeader>
                  <ClientScheduleHearingForm caseId={id} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {hearings.length > 0 ? (
                <div className="space-y-3">
                  {hearings.map((hearing: typeof hearings[number]) => (
                    <div
                      key={hearing.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{hearing.hearingType}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(hearing.hearingDate).toLocaleDateString('es-CO')} • {hearing.hearingTime || 'Sin hora'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={hearing.status === 'scheduled' ? 'warning' : 'secondary'}>
                        {hearing.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay audiencias programadas</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Subir Documento</DialogTitle>
                    <DialogDescription>
                      Carga un nuevo documento para este caso
                    </DialogDescription>
                  </DialogHeader>
                  <ClientUploadDocumentForm caseId={id} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {documentsResult.documents.length > 0 ? (
                <div className="space-y-3">
                  {documentsResult.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.documentType ? documentTypeLabels[doc.documentType] || doc.documentType : 'Documento'} • {' '}
                            {doc.fileSize ? formatFileSize(doc.fileSize) : ''} • {' '}
                            {new Date(doc.createdAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Descargar</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay documentos cargados</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseItem.client ? (
                <>
                  <div>
                    <p className="font-medium text-gray-900">{caseItem.client.user?.name || 'Cliente'}</p>
                    <p className="text-sm text-gray-500">{caseItem.client.user?.email}</p>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Perfil
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Sin cliente asignado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Abogado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseItem.lawyer ? (
                <>
                  <div>
                    <p className="font-medium text-gray-900">{caseItem.lawyer.user?.name || 'Abogado'}</p>
                    <p className="text-sm text-gray-500">{caseItem.lawyer.user?.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Sin abogado asignado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Apertura</p>
                <p className="text-gray-900">
                  {caseItem.openedAt ? new Date(caseItem.openedAt).toLocaleDateString('es-CO') : 
                   caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('es-CO') : 'No definida'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha Estimada de Cierre</p>
                <p className="text-gray-900">
                  {caseItem.expectedClosingDate ? new Date(caseItem.expectedClosingDate).toLocaleDateString('es-CO') : 'No definida'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Cierre</p>
                <p className="text-gray-900">
                  {caseItem.closedAt ? new Date(caseItem.closedAt).toLocaleDateString('es-CO') : 'Abierto'}
                </p>
              </div>
              {caseItem.status !== 'closed' && (ctx.isAdmin || ctx.isLawyer) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Cerrar Caso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                      <DialogTitle>Cerrar Caso</DialogTitle>
                      <DialogDescription>
                        Esta acción marcará el caso como cerrado
                      </DialogDescription>
                    </DialogHeader>
                    <CloseCaseButton caseId={id} caseTitle={caseItem.title} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}