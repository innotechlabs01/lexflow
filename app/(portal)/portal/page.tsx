import {
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClientTimeline } from '@/components/ui/timeline'
import { getAuthContext } from '@/lib/auth/middleware'
import { getCases } from '@/lib/data/cases'
import { getDocuments } from '@/lib/data/documents'
import { redirect } from 'next/navigation'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' }> = {
  open: { label: 'Abierto', variant: 'secondary' },
  in_progress: { label: 'En Progreso', variant: 'success' },
  hearing: { label: 'Audiencia', variant: 'warning' },
  closed: { label: 'Cerrado', variant: 'default' },
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return formatDate(date)
}

function calculateProgress(status: string): number {
  switch (status) {
    case 'open': return 10
    case 'in_progress': return 50
    case 'hearing': return 75
    case 'closed': return 100
    default: return 0
  }
}

export default async function PortalDashboardPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const [casesResult, documentsResult] = await Promise.all([
    getCases(ctx, { limit: 5 }),
    getDocuments(ctx, { limit: 5 }),
  ])

  const firstName = ctx.userId ? 'Cliente' : 'Cliente'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {firstName}
        </h1>
        <p className="text-gray-500">
          Aquí puedes ver el estado de tus casos y actividades recientes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Casos Activos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {casesResult.cases.filter((c) => c.status !== 'closed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Documentos</p>
                    <p className="text-3xl font-bold text-gray-900">{documentsResult.total}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Casos</CardTitle>
                <CardDescription>Seguimiento de tus procesos legales</CardDescription>
              </div>
              <Link href="/portal/cases">
                <Button variant="ghost" size="sm" className="gap-2">
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {casesResult.cases.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No tienes casos registrados aún.
                </p>
              ) : (
                <div className="space-y-4">
                  {casesResult.cases.slice(0, 3).map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      href={`/portal/cases/${caseItem.id}`}
                      className="block p-4 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{caseItem.title}</h3>
                          <p className="text-sm text-gray-500">
                            {caseItem.caseNumber || caseItem.internalCode || caseItem.id.slice(0, 8)}
                          </p>
                        </div>
                        <Badge variant={statusConfig[caseItem.status]?.variant || 'secondary'}>
                          {statusConfig[caseItem.status]?.label || caseItem.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progreso del caso</span>
                          <span className="font-medium text-gray-900">
                            {calculateProgress(caseItem.status)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${calculateProgress(caseItem.status)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Última actualización: {getRelativeTime(caseItem.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>Últimos documentos de tus casos</CardDescription>
              </div>
              <Link href="/portal/documents">
                <Button variant="ghost" size="sm" className="gap-2">
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {documentsResult.documents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay documentos disponibles.
                </p>
              ) : (
                <div className="space-y-3">
                  {documentsResult.documents.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar
                      </Button>
                    </div>
                  ))}
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
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm">Total Casos</span>
                  </div>
                  <span className="font-bold">{casesResult.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Casos Cerrados</span>
                  </div>
                  <span className="font-bold">
                    {casesResult.cases.filter((c) => c.status === 'closed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-warning" />
                    <span className="text-sm">Documentos</span>
                  </div>
                  <span className="font-bold">{documentsResult.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-[#2563eb] text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">¿Tienes preguntas?</p>
                  <p className="text-sm text-white/80">Comunícate con tu abogado</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full gap-2">
                <MessageSquare className="w-4 h-4" />
                Enviar Mensaje
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
