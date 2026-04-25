import { notFound } from 'next/navigation'
import {
  Building2,
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  List,
  Banknote,
  Clock,
  BarChart3,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getClient } from '@/lib/data/db-client'
import { OrganizationActions } from '@/components/super-admin/organization-actions'

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspendido', color: 'bg-red-100 text-red-700' },
}

const planConfig: Record<string, { label: string; badge: string }> = {
  free: { label: 'Free', badge: 'bg-gray-100 text-gray-700' },
  pro: { label: 'Pro', badge: 'bg-blue-100 text-blue-700' },
  enterprise: { label: 'Enterprise', badge: 'bg-primary-100 text-primary-700' },
}

// Función para obtener información completa de la organización
async function getOrganization(id: string) {
  const client = getClient()
  if (!client) return null
  
  const result = await client.execute({
    sql: 'SELECT * FROM organizations WHERE id = ?',
    args: [id]
  })
  return result.rows?.[0] || null
}

// Función para obtener estadísticas
async function getOrgStats(orgId: string) {
  const client = getClient()
  if (!client) return { users: 0, clients: 0, cases: 0, documents: 0, hearings: 0 }
  
  const [userResult, clientResult, caseResult] = await Promise.all([
    client.execute({ sql: 'SELECT count(*) as count FROM users WHERE organization_id = ?', args: [orgId] }),
    client.execute({ sql: 'SELECT count(*) as count FROM clients WHERE organization_id = ?', args: [orgId] }),
    client.execute({ sql: 'SELECT count(*) as count FROM cases WHERE organization_id = ?', args: [orgId] }),
  ])

  return {
    users: Number(userResult.rows?.[0]?.count || 0),
    clients: Number(clientResult.rows?.[0]?.count || 0),
    cases: Number(caseResult.rows?.[0]?.count || 0),
    documents: 0,
    hearings: 0
  }
}

// Función para obtener usuarios
async function getOrgUsers(orgId: string) {
  const client = getClient()
  if (!client) return []
  
  const result = await client.execute({
    sql: 'SELECT id, name, email, role, status, created_at FROM users WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50',
    args: [orgId]
  })
  
  return result.rows || []
}

// Función para obtener actividad reciente
async function getRecentActivity(orgId: string) {
  const client = getClient()
  return { cases: [], documents: [] }
}

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const organization = await getOrganization(id)

  if (!organization) {
    notFound()
  }

  const stats = await getOrgStats(id)
  const orgUsers = await getOrgUsers(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <a href="/super-admin/organizations">Volver</a>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-500">{organization.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" disabled>
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" className="gap-2" disabled>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información de la Organización */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Información de la Organización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Nombre de la Organización</p>
              <p className="text-xl font-bold text-gray-900">{organization.name}</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Industria</p>
              {/* This field will be available after database migration */}
              <p className="text-gray-700">{(organization as any).industry || 'Legal / Abogacía'}</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Tamaño</p>
              {/* This field will be available after database migration */}
              <p className="text-gray-700">
                {((organization as any).employeeCount?.toString() || '50')} empleados
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
              <p className="text-gray-700">
                {new Date(Number(organization.createdAt) * 1000).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Ubicación</p>
              {/* These fields will be available after database migration */}
              <p className="text-gray-700">
                {((organization as any).address || 'Calle Principal 123')},
                {((organization as any).city || 'Bogotá')},
                {((organization as any).country || 'Colombia')}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-500">Contacto</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a href={`mailto:${organization.contactEmail || ('contacto@' + organization.slug + '.com')}`}
                  className="text-primary hover:underline">
                  {organization.contactEmail || ('contacto@' + organization.slug + '.com')}
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="text-gray-700">{organization.contactPhone || '+57 300 123 4567'}</p>
              </div>
              {organization.website && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {organization.website}
                  </a>
                </div>
              )}
              {!organization.website && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                  <p className="text-gray-400 italic">Por configurar</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan y Estado */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Plan y Estado</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">Plan Actual</p>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Banknote className="w-4 h-4 text-gray-600" />
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: organization.plan === 'enterprise' ? 'rgba(123, 31, 162, 0.1)' :
                    organization.plan === 'pro' ? 'rgba(59, 130, 246, 0.1)' :
                      'rgba(156, 163, 175, 0.1)',
                  color: organization.plan === 'enterprise' ? 'text-primary-700' :
                    organization.plan === 'pro' ? 'text-blue-700' :
                      'text-gray-700'
                }}
              >
                {organization.plan === 'enterprise' ? 'Enterprise' : organization.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">Estado de la Cuenta</p>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: organization.status === 'active' ? 'rgba(16, 185, 129, 0.1)' :
                    organization.status === 'trial' ? 'rgba(245, 158, 11, 0.1)' :
                      'rgba(239, 68, 68, 0.1)',
                  color: organization.status === 'active' ? 'text-emerald-700' :
                    organization.status === 'trial' ? 'text-amber-700' :
                      'text-red-700'
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: organization.status === 'active' ? 'bg-emerald-500' :
                      organization.status === 'trial' ? 'bg-amber-500' :
                        'bg-red-500'
                  }}
                />
                {organization.status === 'active' ? 'Activo' :
                  organization.status === 'trial' ? 'Trial' :
                    'Suspendido'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Hardcoded for now to avoid TypeScript issues */}
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {organization.plan}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-500">Estado de la Cuenta</p>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${organization.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                organization.status === 'trial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${organization.status === 'active' ? 'bg-emerald-500' : organization.status === 'trial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                {organization.status === 'active' ? 'Activo' :
                  organization.status === 'trial' ? 'Trial' :
                    'Suspendido'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Estadísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary-900">{stats.users}</p>
            <p className="text-sm text-primary-700">Usuarios Activos</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.clients}</p>
            <p className="text-sm text-blue-700">Clientes Registrados</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Briefcase className="w-10 h-10 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{stats.cases}</p>
            <p className="text-sm text-orange-700">Casos Abiertos</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <List className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.documents}</p>
            <p className="text-sm text-green-700">Documentos</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Calendar className="w-10 h-10 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.hearings}</p>
            <p className="text-sm text-yellow-700">Audiencias Programadas</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <BarChart3 className="w-10 h-10 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-pink-900">Crecimiento</p>
            <p className="text-sm text-pink-700">Mensual</p>
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      {/*<Card className="bg-white">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Casos Actualizados
              <span className="text-xs text-gray-400">Últimos 5</span>
            </p>
            {recentActivity.cases.length > 0 ? (
              recentActivity.cases.map((caseItem) => (
                <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {caseItem.caseNumber?.substring(0, 2) || '##'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-500">
                        {caseItem.caseNumber || 'Sin número de caso'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {caseItem.status === 'open' ? 'Abierto' :
                      caseItem.status === 'in_progress' ? 'En Progreso' :
                        caseItem.status === 'hearing' ? 'Audiencia' :
                          caseItem.status === 'closed' ? 'Cerrado' : caseItem.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay casos recientes</p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Documentos Recientes
              <span className="text-xs text-gray-400">Últimos 5</span>
            </p>
            {recentActivity.documents.length > 0 ? (
              recentActivity.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">
                      {doc.documentType === 'contract' ? 'C' :
                        doc.documentType === 'petition' ? 'P' :
                          doc.documentType === 'evidence' ? 'E' : 'D'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.documentType}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(doc.createdAt ? Number(doc.createdAt) * 1000 : Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay documentos recientes</p>
            )}
          </div>
        </CardContent>
      </Card>*/}

      {/* Administradores */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Administradores</span>
            <span className="text-sm font-normal text-slate-500">
              {orgUsers.length} de {(organization as any).employeeCount || 10}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orgUsers.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              No hay administradores registrados
            </p>
          ) : (
            <div className="space-y-3">
              {orgUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.status === 'active' ? 'Activo' : user.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <OrganizationActions 
        organizationId={organization.id} 
        organizationName={organization.name}
        currentUserCount={stats.users}
        maxUsers={(organization as any).employeeCount || 10}
      />
    </div>
  )
}