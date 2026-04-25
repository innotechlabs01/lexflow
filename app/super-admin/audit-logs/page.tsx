import { Search, Filter, FileText, Clock, User, Building2, Briefcase } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs } from '@/lib/data/dashboard'

const actionConfig: Record<string, { label: string; color: string }> = {
  create: { label: 'Creado', color: 'bg-green-100 text-green-700' },
  update: { label: 'Actualizado', color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Eliminado', color: 'bg-red-100 text-red-700' },
  login: { label: 'Inicio de sesión', color: 'bg-primary-100 text-primary-700' },
  logout: { label: 'Cierre de sesión', color: 'bg-gray-100 text-gray-700' },
  export: { label: 'Exportado', color: 'bg-orange-100 text-orange-700' },
}

const entityConfig: Record<string, { label: string; icon: React.ElementType }> = {
  user: { label: 'Usuario', icon: User },
  organization: { label: 'Organización', icon: Building2 },
  case: { label: 'Caso', icon: Briefcase },
  document: { label: 'Documento', icon: FileText },
}

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100)

  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const today = new Date()
      const logDate = new Date(l.createdAt * 1000)
      return logDate.toDateString() === today.toDateString()
    }).length,
    users: new Set(logs.map(l => l.userId).filter(Boolean)).size,
    actions: Object.keys(actionConfig).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
          <p className="text-gray-500">
            Registro de actividades del sistema
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Acciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                <p className="text-sm text-gray-500">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-500">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.actions}</p>
                <p className="text-sm text-gray-500">Tipos de Acción</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar en logs..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No hay registros de auditoría
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const action = actionConfig[log.action]
                const entity = entityConfig[log.entity]

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {new Date(log.createdAt * 1000).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt * 1000).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.userId || 'Sistema'}</p>
                        <p className="text-sm text-gray-500">-</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${action?.color || 'bg-gray-100 text-gray-700'}`}>
                        {action?.label || log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entity?.label || log.entity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-[200px]">{log.entityId || '-'}</p>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}