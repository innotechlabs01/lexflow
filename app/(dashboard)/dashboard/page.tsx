import {
  Briefcase,
  Users,
  Building2,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthContext } from '@/lib/auth/middleware'
import { getDashboardStats, getRecentCases, getUpcomingHearings, getPendingTasks } from '@/lib/data/dashboard'

const statusLabels: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En Progreso',
  closed: 'Cerrado',
}

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  normal: 'Normal',
  low: 'Baja',
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  lawyer: 'Abogado',
  client: 'Cliente',
}

export default async function DashboardPage() {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    redirect('/sign-in')
  }

  const clerkUser = await currentUser()
  const firstName = clerkUser?.firstName || clerkUser?.username || 'Usuario'
  const userRole = ctx.role
  const isAdmin = ctx.isAdmin || ctx.isSuperAdmin

  const [stats, recentCases, upcomingHearings, pendingTasks] = await Promise.all([
    getDashboardStats(ctx),
    getRecentCases(ctx, 5),
    getUpcomingHearings(ctx, 3),
    getPendingTasks(ctx, 5),
  ])

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {ctx.isSuperAdmin ? 'Panel de Administración' : `Bienvenido, ${firstName}`}
          </h1>
          <p className="text-gray-500">
            {ctx.isSuperAdmin 
              ? 'Vista global del sistema' 
              : ctx.isAdmin 
                ? 'Gestiona tu organización'
                : ctx.isClient 
                  ? 'Consulta tus casos y documentos'
                  : 'Casos asignados y tareas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{firstName}</p>
            <p className="text-xs text-gray-500">{roleLabels[userRole] || 'Usuario'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                <p className="text-sm text-gray-500">Casos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-sm text-gray-500">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
                <p className="text-sm text-gray-500">Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHearings}</p>
                <p className="text-sm text-gray-500">Audiencias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Casos Recientes</CardTitle>
              <Link href="/cases" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentCases.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay casos recientes</p>
            ) : (
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <Link 
                    key={caseItem.id} 
                    href={`/cases/${caseItem.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{caseItem.title}</p>
                      <p className="text-sm text-gray-500">{caseItem.caseNumber || caseItem.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        caseItem.status === 'open' ? 'secondary' :
                        caseItem.status === 'in_progress' ? 'default' :
                        'outline'
                      }>
                        {statusLabels[caseItem.status] || caseItem.status}
                      </Badge>
                      <Badge variant={
                        caseItem.priority === 'urgent' ? 'danger' :
                        caseItem.priority === 'high' ? 'warning' :
                        'secondary'
                      }>
                        {priorityLabels[caseItem.priority] || caseItem.priority}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tareas Pendientes</CardTitle>
              <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todas →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay tareas pendientes</p>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      {task.caseTitle && (
                        <p className="text-sm text-gray-500">{task.caseTitle}</p>
                      )}
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {upcomingHearings.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximas Audiencias</CardTitle>
              <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver calendario →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingHearings.map((hearing) => (
                <div key={hearing.id} className="p-4 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-900">{hearing.caseTitle}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Intl.DateTimeFormat('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(hearing.hearingDate))}
                  </p>
                  {hearing.court && (
                    <p className="text-xs text-gray-400 mt-1">{hearing.court}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}