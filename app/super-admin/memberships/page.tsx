import { 
  Building2, 
  Users, 
  Scale, 
  UserCog, 
  CreditCard, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { organizations, memberships, users } from '@/lib/db/schema'
import { eq, desc, gte, lte, and, count, sql } from 'drizzle-orm'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  trial: { label: 'Prueba', color: 'bg-amber-100 text-amber-700', icon: Clock },
  expired: { label: 'Expirada', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

const planLabels: Record<string, string> = {
  free: 'Free',
  pro: 'Pro', 
  enterprise: 'Enterprise',
}

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-primary-100 text-primary-700',
}

async function getAllMemberships() {
  const orgsWithMemberships = await db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    plan: organizations.plan,
    status: organizations.status,
  }).from(organizations)
  .leftJoin(memberships, eq(organizations.id, memberships.organizationId))
  .orderBy(desc(organizations.createdAt))
  
  return orgsWithMemberships
}

async function getMembershipStats() {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const activeCount = await db.select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(eq(memberships.status, 'active'))
  
  const expiringCount = await db.select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(and(
      eq(memberships.status, 'active'),
      gte(memberships.expiresAt, now),
      lte(memberships.expiresAt, thirtyDaysFromNow)
    ))
  
  const trialCount = await db.select({ count: sql<number>`count(*)` })
    .from(organizations)
    .where(eq(organizations.status, 'trial'))
  
  return {
    active: Number(activeCount[0]?.count) || 0,
    expiring: Number(expiringCount[0]?.count) || 0,
    trial: Number(trialCount[0]?.count) || 0,
  }
}

async function getOrgUsersCount(orgId: string) {
  const [admins, lawyers, clients] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.organizationId, orgId), eq(users.role, 'admin'))),
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.organizationId, orgId), eq(users.role, 'lawyer'))),
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.organizationId, orgId), eq(users.role, 'client'))),
  ])
  
  return {
    admins: Number(admins[0]?.count) || 0,
    lawyers: Number(lawyers[0]?.count) || 0,
    clients: Number(clients[0]?.count) || 0,
  }
}

export default async function MembershipsPage() {
  const organizationsData = await getAllMemberships()
  const stats = await getMembershipStats()
  
  const enrichedOrgs = await Promise.all(
    organizationsData.map(async (org: any) => {
      const userCounts = await getOrgUsersCount(org.id)
      return { ...org, ...userCounts }
    })
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Membresías</h1>
        <p className="text-gray-500">
          Seguimiento de membresías, planes y_usage de cada organización
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{enrichedOrgs.length}</p>
                <p className="text-sm text-gray-500">Organizaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Membresías Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.trial}</p>
                <p className="text-sm text-gray-500">En Prueba</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.expiring}</p>
                <p className="text-sm text-gray-500">Por Vencer (30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Todas las Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Organización</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Estado</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase">
                    <UserCog className="w-4 h-4 inline mr-1" />Admins
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase">
                    <Scale className="w-4 h-4 inline mr-1" />Abogados
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase">
                    <Users className="w-4 h-4 inline mr-1" />Clientes
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {enrichedOrgs.map((org) => {
                  const StatusIcon = statusConfig[org.status || 'active']?.icon || AlertCircle
                  const isExpiring = false // Could check expiration date
                  
                  return (
                    <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/super-admin/organizations/${org.id}`} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            org.plan === 'enterprise' ? 'bg-primary-100 text-primary' :
                            org.plan === 'pro' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 hover:text-primary">{org.name}</p>
                            <p className="text-sm text-gray-500">{org.slug}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${planColors[org.plan || 'free']}`}>
                          {planLabels[org.plan || 'free']}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[org.status || 'active']?.color || statusConfig.active.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[org.status || 'active']?.label || 'Activa'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900 font-medium">{org.admins}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900 font-medium">{org.lawyers}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-900 font-medium">{org.clients}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm ${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                          {isExpiring ? 'Por vencer' : 'Activa'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {enrichedOrgs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No hay organizaciones registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}