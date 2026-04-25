'use client'

import {
  Building2,
  Users,
  Scale,
  UserCog,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OrganizationsChart } from '@/components/super-admin/organizations-chart'

interface DashboardData {
  chartData: { date: string; count: number }[]
  organizations: any[]
  membershipStats: { active: number; trial: number; suspended: number }
  userStats: { admins: number; lawyers: number; clients: number }
  planCounts: { enterprise: number; pro: number; free: number }
}

export function SuperAdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [periodOffset, setPeriodOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/super-admin/stats?period=${period}&offset=${periodOffset}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period, periodOffset])

  const getPeriodLabel = () => {
    const now = new Date()
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365
    const offsetDays = periodOffset * periodDays
    const endDate = new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000)
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
    if (period === 'week') {
      return `${startDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (period === 'month') return endDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    return endDate.toLocaleDateString('es-CO', { year: 'numeric' })
  }

  const handleNavigate = (dir: 'prev' | 'next') => {
    if (dir === 'next') {
      if (periodOffset > 0) setPeriodOffset(periodOffset - 1)
    } else {
      setPeriodOffset(periodOffset + 1)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500">Gestiona tus organizaciones, membresías y seguimiento de buffetes</p>
        </header>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500">Gestiona tus organizaciones, membresías y seguimiento de buffetes</p>
        </header>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error || 'Error loading data'}</p>
        </div>
      </div>
    )
  }

  const { chartData, organizations, membershipStats, userStats, planCounts } = data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="text-gray-500">
          Gestiona tus organizaciones, membresías y seguimiento de buffetes
        </p>
      </header>

      {/* Stats Grid - Resumen de Planes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-900">{planCounts.enterprise}</p>
                <p className="text-sm text-primary-700">Empresas Enterprise</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-900">{planCounts.pro}</p>
                <p className="text-sm text-blue-700">Organizaciones Pro</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{planCounts.free}</p>
                <p className="text-sm text-gray-600">Usuarios Free</p>
              </div>
              <div className="p-3 bg-gray-200 rounded-xl">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Membresías */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{membershipStats.active}</p>
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
                <p className="text-2xl font-bold text-gray-900">{membershipStats.trial}</p>
                <p className="text-sm text-gray-500">En Período de Prueba</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{membershipStats.suspended}</p>
                <p className="text-sm text-gray-500">Suspendidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart de Organizaciones */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Crecimiento de Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">No hay datos para el período seleccionado</p>
            </div>
          ) : (
            <OrganizationsChart 
              data={chartData} 
              period={period} 
              setPeriod={setPeriod}
              onNavigate={handleNavigate}
              currentLabel={getPeriodLabel()}
            />
          )}
        </CardContent>
      </Card>

      {/* Distribución de Usuarios por Rol */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribución de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-primary-50 rounded-lg">
              <UserCog className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-900">{userStats.admins}</p>
              <p className="text-sm text-primary-700">Administradores</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Scale className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{userStats.lawyers}</p>
              <p className="text-sm text-blue-700">Abogados</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{userStats.clients}</p>
              <p className="text-sm text-green-700">Clientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Organizaciones */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todas las Organizaciones</CardTitle>
            <Link
              href="/super-admin/organizations"
              className="text-sm text-primary hover:text-primary-700 font-medium"
            >
              Gestionar →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Organización</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase">Estado</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase"><Scale className="w-4 h-4 inline mr-1" />Abogados</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase"><Users className="w-4 h-4 inline mr-1" />Clientes</th>
                  <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 uppercase">Casos</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay organizaciones todavía</td></tr>
                ) : (
                  organizations.slice(0, 5).map((org) => (
                    <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/super-admin/organizations/${org.id}`} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${org.plan === 'enterprise' ? 'bg-primary-100 text-primary-600' : org.plan === 'pro' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {org.name?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 hover:text-primary">{org.name}</p>
                            <p className="text-sm text-gray-500">{org.slug}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${org.plan === 'enterprise' ? 'bg-primary-100 text-primary-700 border-primary-200' : org.plan === 'pro' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {org.plan === 'enterprise' ? 'Enterprise' : org.plan === 'pro' ? 'Pro' : 'Free'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${org.status === 'active' ? 'bg-emerald-100 text-emerald-700' : org.status === 'trial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : org.status === 'trial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          {org.status === 'active' ? 'Activo' : org.status === 'trial' ? 'Trial' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center"><span className="text-gray-900 font-medium">{Math.floor((org.userCount || 0) * 0.4)}</span></td>
                      <td className="py-4 px-4 text-center"><span className="text-gray-900 font-medium">{org.clientCount || 0}</span></td>
                      <td className="py-4 px-4 text-center"><span className="text-gray-900 font-medium">{org.caseCount || 0}</span></td>
                    </tr>
                  ))
                )}
                {organizations.length > 5 && (
                  <tr><td colSpan={6} className="text-center py-4"><Link href="/super-admin/organizations" className="text-primary hover:underline text-sm font-medium">Ver todas las organizaciones ({organizations.length}) →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}