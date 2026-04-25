import { Plus, Search, Filter, Eye, Edit } from 'lucide-react'
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
import Link from 'next/link'
import { getAuthContext } from '@/lib/auth/middleware'
import { getCases, getCaseStats } from '@/lib/data/cases'
import { redirect } from 'next/navigation'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'danger' }> = {
  open: { label: 'Abierto', variant: 'secondary' },
  in_progress: { label: 'En Progreso', variant: 'success' },
  hearing: { label: 'Audiencia', variant: 'warning' },
  appeal: { label: 'Apelación', variant: 'default' },
  closed: { label: 'Cerrado', variant: 'secondary' },
  archived: { label: 'Archivado', variant: 'secondary' },
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

export default async function CasesPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const [casesResult, stats] = await Promise.all([
    getCases(ctx, { limit: 50 }),
    getCaseStats(ctx),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
          <p className="text-gray-500">
            Gestiona todos tus casos legales
            {stats.total > 0 && (
              <span className="ml-2 text-gray-400">({stats.total} en total)</span>
            )}
          </p>
        </div>
        {(ctx.isAdmin || ctx.isLawyer) && (
          <Link href="/cases/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Caso
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div key={status} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">{statusConfig[status]?.label || status}</p>
            <p className="text-2xl font-bold">{Number(count)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar casos..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caso</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha de Apertura</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casesResult.cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No hay casos registrados. Crea tu primer caso para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              casesResult.cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-500">
                        {caseItem.caseNumber || caseItem.internalCode || caseItem.id.slice(0, 8)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {caseItem.client?.user?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {caseItem.caseType ? typeConfig[caseItem.caseType] : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[caseItem.status]?.variant || 'secondary'}>
                      {statusConfig[caseItem.status]?.label || caseItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityConfig[caseItem.priority]?.variant || 'secondary'}>
                      {priorityConfig[caseItem.priority]?.label || caseItem.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(caseItem.openedAt || caseItem.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/cases/${caseItem.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {(ctx.isAdmin || ctx.isLawyer) && (
                        <Link href={`/cases/${caseItem.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
