import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, Circle, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthContext } from '@/lib/auth/middleware'
import { getTasks } from '@/lib/data/tasks'
import { getCases } from '@/lib/data/cases'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ClientCreateTaskForm } from './client-create-task-form'
import { getUsers } from '@/lib/data/users'

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgente', color: 'bg-danger-100 text-danger-700' },
  high: { label: 'Alta', color: 'bg-warning-100 text-warning-700' },
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendiente', icon: Circle },
  in_progress: { label: 'En Progreso', icon: Clock },
  completed: { label: 'Completada', icon: CheckCircle },
  blocked: { label: 'Bloqueada', icon: AlertCircle },
}

const taskTypeConfig: Record<string, string> = {
  research: 'Investigación',
  document: 'Documento',
  court_filing: 'Presentación Judicial',
  client_meeting: 'Reunión con Cliente',
  hearing_prep: 'Preparación Audiencia',
  deadline: 'Fecha Límite',
  follow_up: 'Seguimiento',
  internal: 'Interno',
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

export default async function TasksPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const [{ tasks: tasksList, total, byStatus }, casesResult, usersResult] = await Promise.all([
    getTasks(ctx, { limit: 50 }),
    getCases(ctx, { limit: 100 }),
    getUsers(ctx),
  ])

  const pendingTasks = tasksList.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const completedTasks = tasksList.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500">
            Gestiona y asigna tareas
            {total > 0 && <span className="ml-2 text-gray-400">({total} en total)</span>}
          </p>
        </div>
        {(ctx.isAdmin || ctx.isLawyer) && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Asigna una tarea a ti o a un miembro del equipo
                </DialogDescription>
              </DialogHeader>
              <ClientCreateTaskForm 
                cases={casesResult.cases.map(c => ({ id: c.id, title: c.title }))}
                users={usersResult.users.map(u => ({ id: u.id, name: u.name, email: u.email }))}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar tareas..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">Total Tareas</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning-600">
                  {byStatus.pending || 0}
                </p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
              <div className="p-2 bg-warning-100 rounded-lg">
                <Circle className="h-5 w-5 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {byStatus.in_progress || 0}
                </p>
                <p className="text-sm text-gray-500">En Progreso</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success-600">
                  {byStatus.completed || 0}
                </p>
                <p className="text-sm text-gray-500">Completadas</p>
              </div>
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay tareas pendientes</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          task.status === 'in_progress'
                            ? 'border-primary-500 bg-primary-100'
                            : 'border-gray-300'
                        }`}>
                          {task.status === 'in_progress' && (
                            <div className="h-2 w-2 rounded-full bg-primary-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {task.case?.title || 'Sin caso asignado'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[task.priority]?.color || 'bg-gray-100 text-gray-700'}`}>
                              {priorityConfig[task.priority]?.label || task.priority}
                            </span>
                            <span className="text-xs text-gray-400">
                              Vence: {formatDate(task.dueDate)}
                            </span>
                          </div>
                          {task.assignee && (
                            <p className="text-xs text-gray-400 mt-1">
                              Asignado a: {task.assignee.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              Tareas Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay tareas completadas</p>
            ) : (
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-5 w-5 rounded-full bg-success-100 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-success-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-500 line-through">{task.title}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {task.case?.title || 'Sin caso asignado'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Completada: {formatDate(task.completedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
