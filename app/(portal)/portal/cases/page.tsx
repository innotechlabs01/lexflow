import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Calendar, Clock, ArrowRight, Search, Filter } from 'lucide-react'
import { getAuthContext } from '@/lib/auth/middleware'
import { getCases } from '@/lib/data/cases'
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

export default async function PortalCasesPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const { cases: casesList } = await getCases(ctx, { limit: 50 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Casos</h1>
          <p className="text-gray-500">Seguimiento de todos tus procesos legales</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar casos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {casesList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes casos</h3>
            <p className="text-gray-500">Cuando tu abogado cree un caso asociado a ti, lo verás aquí.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {casesList.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/portal/cases/${caseItem.id}`}
              className="block"
            >
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            {caseItem.caseNumber || caseItem.internalCode || caseItem.id.slice(0, 8)}
                          </span>
                          {caseItem.caseType && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">{typeConfig[caseItem.caseType]}</span>
                            </>
                          )}
                          {caseItem.lawyer && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">Abogado: {caseItem.lawyer.user?.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[caseItem.status]?.color || 'text-gray-600 bg-gray-100'}`}>
                      {statusConfig[caseItem.status]?.label || caseItem.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Actualizado: {getRelativeTime(caseItem.updatedAt)}</span>
                      </div>
                      {caseItem.openedAt && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Apertura: {formatDate(caseItem.openedAt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">Ver detalles</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
