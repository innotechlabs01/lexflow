import { Plus, Search, Filter, Building2, Users, Briefcase, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { OrganizationsTable, Organization } from '@/components/super-admin/organizations-table'
import { getAllOrganizations } from '@/lib/data/dashboard'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  trial: { label: 'Trial', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspendido', color: 'bg-red-100 text-red-700' },
}

const planConfig: Record<string, { label: string; badge: 'default' | 'secondary' | 'outline' }> = {
  free: { label: 'Free', badge: 'outline' },
  pro: { label: 'Pro', badge: 'secondary' },
  enterprise: { label: 'Enterprise', badge: 'default' },
}

export default async function OrganizationsPage() {
  const organizationStats = await getAllOrganizations(1, 100)
  // Convert OrganizationStats to Organization for the table component
  const organizations: Organization[] = organizationStats.map(stat => ({
    id: stat.id,
    name: stat.name,
    slug: stat.slug,
    plan: stat.plan,
    status: stat.status,
    logoUrl: stat.logoUrl,
    settings: stat.settings,
    // Business/organizational details
    industry: stat.industry || '',
    employeeCount: stat.employeeCount || 0,
    address: stat.address || '',
    city: stat.city || '',
    country: stat.country || '',
    contactEmail: stat.contactEmail || '',
    contactPhone: stat.contactPhone || '',
    website: stat.website || '',
    createdAt: stat.createdAt,
    updatedAt: stat.updatedAt,
    // Stats
    userCount: stat.userCount,
    caseCount: stat.caseCount,
    clientCount: stat.clientCount,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizaciones</h1>
          <p className="text-gray-500">
            Gestiona todas las organizaciones del sistema
          </p>
        </div>
        <OrganizationsTable organizations={organizations} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar organizaciones..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Todas las Organizaciones ({organizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organización</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Usuarios</TableHead>
                  <TableHead className="text-center">Casos</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay organizaciones. Crea la primera.
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id} className="hover:bg-gray-50">
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant={planConfig[org.plan]?.badge || 'outline'}>
                          {planConfig[org.plan]?.label || org.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[org.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            org.status === 'active' ? 'bg-emerald-500' :
                            org.status === 'trial' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                          {statusConfig[org.status]?.label || org.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{org.userCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{org.caseCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{org.clientCount}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/super-admin/organizations/${org.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalles
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}