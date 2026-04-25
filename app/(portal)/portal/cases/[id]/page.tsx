import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  User,
  Building,
  Download,
  MessageSquare,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientTimeline } from '@/components/ui/timeline'
import { getAuthContext } from '@/lib/auth/middleware'
import { getPortalCaseById, getPortalCaseEvents, getPortalCaseDocuments } from '@/lib/data'
import { redirect } from 'next/navigation'

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'text-gray-600 bg-gray-100' },
  in_progress: { label: 'En Progreso', color: 'text-emerald-600 bg-emerald-100' },
  hearing: { label: 'Audiencia Pendiente', color: 'text-amber-600 bg-amber-100' },
  closed: { label: 'Cerrado', color: 'text-blue-600 bg-blue-100' },
}

const typeConfig: Record<string, string> = {
  labor: 'Laboral',
  civil: 'Civil',
  criminal: 'Penal',
  family: 'Familia',
  administrative: 'Administrativo',
  constitutional: 'Constitucional',
  commercial: 'Comercial',
  property: 'Inmobiliario',
  tax: 'Tributario',
  other: 'Otro',
}

const documentTypeColors: Record<string, { bg: string; text: string }> = {
  petition: { bg: 'bg-blue-100', text: 'text-blue-600' },
  contract: { bg: 'bg-purple-100', text: 'text-purple-600' },
  evidence: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  ruling: { bg: 'bg-amber-100', text: 'text-amber-600' },
  motion: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  other: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const documentTypeLabels: Record<string, string> = {
  petition: 'Demanda',
  contract: 'Contrato',
  evidence: 'Prueba',
  ruling: 'Sentencia',
  motion: 'Escrito',
  other: 'Otro',
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function formatCurrency(amount: number | null, currency: string = 'COP'): string {
  if (amount === null) return '-'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default async function PortalCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const { id } = await params
  const caseItem = await getPortalCaseById(ctx, id)

  if (!caseItem) {
    notFound()
  }

  const [events, documents] = await Promise.all([
    getPortalCaseEvents(ctx, id),
    getPortalCaseDocuments(ctx, id),
  ])

  const timelineEvents = events.slice(0, 5).map((event: any) => ({
    id: event.id,
    type: event.eventType as 'procedural' | 'document' | 'hearing' | 'status_change' | 'internal_note',
    title: event.title,
    description: event.description || '',
    date: formatDate(event.eventDate),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/portal/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{caseItem.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-500">
              {caseItem.caseNumber || caseItem.internalCode || id.slice(0, 8)}
            </span>
            {caseItem.caseType && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">{typeConfig[caseItem.caseType]}</span>
              </>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[caseItem.status]?.color || 'text-gray-600 bg-gray-100'}`}>
              {statusConfig[caseItem.status]?.label || caseItem.status}
            </div>
          </div>
        </div>
        <Button className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Mensaje a Abogado
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre tu Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                {caseItem.description || 'No hay descripción disponible para este caso.'}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {caseItem.court && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Juzgado</p>
                    <p className="font-medium text-gray-900">{caseItem.court}</p>
                  </div>
                )}
                {caseItem.judge && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Juez</p>
                    <p className="font-medium text-gray-900">{caseItem.judge}</p>
                  </div>
                )}
                {caseItem.radicado && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Radicado</p>
                    <p className="font-medium text-gray-900 font-mono">{caseItem.radicado}</p>
                  </div>
                )}
                {caseItem.amountInDispute && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Monto en Disputa</p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(caseItem.amountInDispute, caseItem.currency)}
                    </p>
                  </div>
                )}
                {caseItem.openedAt && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Apertura</p>
                    <p className="font-medium text-gray-900">{formatDate(caseItem.openedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Línea de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay actividad registrada en este caso.
                </p>
              ) : (
                <ClientTimeline events={timelineEvents} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay documentos disponibles para este caso.
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc: any) => {
                    const colors = documentTypeColors[doc.documentType || 'other'] || { bg: 'bg-gray-100', text: 'text-gray-600' }
                    const typeLabel = documentTypeLabels[doc.documentType || 'other'] || 'Otro'

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${colors.bg}`}>
                            <FileText className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${colors.bg} ${colors.text}`}>
                                {typeLabel}
                              </span>
                              <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500">{formatDate(doc.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Descargar
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Información del Caso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[caseItem.status]?.color || 'text-gray-600 bg-gray-100'}`}>
                    {statusConfig[caseItem.status]?.label || caseItem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Última actualización</span>
                  <span className="text-sm font-medium">{formatDate(caseItem.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Tu Abogado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseItem.lawyer?.user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#2563eb] flex items-center justify-center text-white font-bold">
                      {caseItem.lawyer.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{caseItem.lawyer.user.name}</p>
                      <p className="text-sm text-gray-500">Abogado Asignado</p>
                    </div>
                  </div>
                  {caseItem.lawyer.user.email && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>{caseItem.lawyer.user.email}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No hay abogado asignado</p>
              )}
              <Button className="w-full gap-2">
                <MessageSquare className="w-4 h-4" />
                Enviar Mensaje
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <p className="font-semibold">Caso en Buenas Manos</p>
                  <p className="text-sm text-white/80">Estamos trabajando para ti</p>
                </div>
              </div>
              <p className="text-sm text-white/90">
                Tu abogado está activamente trabajando en tu caso. Te mantendremos informado de cada actualización.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
