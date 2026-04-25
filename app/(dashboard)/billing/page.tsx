'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Settings,
  Upload,
  HelpCircle,
  Search,
  Plus,
  BarChart3,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  client: string
  matter: string
  invoiceId: string
  date: string
  amount: number
  status: string
}

interface RevenueData {
  month: string
  value: number
  isCurrent: boolean
}

function getTransactions(): Promise<Transaction[]> {
  return fetch('/api/transactions').then(res => res.ok ? res.json() : Promise.resolve([])).catch(() => [])
}

function getRevenueData(): Promise<RevenueData[]> {
  return fetch('/api/revenue').then(res => res.ok ? res.json() : Promise.resolve([
    { month: 'ENE', value: 0, isCurrent: false },
    { month: 'FEB', value: 0, isCurrent: false },
    { month: 'MAR', value: 0, isCurrent: false },
    { month: 'ABR', value: 0, isCurrent: true },
  ])).catch(() => [])
}

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTransactions(), getRevenueData()])
      .then(([txData, revData]) => {
        setTransactions(txData)
        setRevenueData(revData)
      })
      .finally(() => setLoading(false))
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'overdue': return 'danger'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2 z-50">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold tracking-tight text-blue-700">LexFlow</h1>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Legal Enterprise</p>
        </div>

        <nav className="flex-grow flex flex-col gap-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/dashboard">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/cases">
            <FolderOpen className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Casos</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/billing">
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Facturación</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/calendar">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Agenda</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/clients">
            <Users className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Clientes</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-blue-500 transition-colors rounded-lg" href="/settings">
            <Settings className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Configuración</span>
          </a>
        </nav>

        <Button className="mt-auto w-full gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Caso
        </Button>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64"
                placeholder="Buscar..."
                type="text"
              />
            </div>
          </div>
        </header>

        <div className="pt-24 px-12 pb-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Facturación</h2>
              <p className="text-gray-500 mt-1 text-lg">Gestiona facturas y pagos.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ingresos Este Mes</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(transactions.reduce((sum, t) => t.status === 'paid' ? sum + t.amount : sum, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Pendiente</p>
                <p className="text-3xl font-bold text-warning">
                  {formatCurrency(transactions.reduce((sum, t) => t.status === 'pending' ? sum + t.amount : sum, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Vencido</p>
                <p className="text-3xl font-bold text-danger">
                  {formatCurrency(transactions.reduce((sum, t) => t.status === 'overdue' ? sum + t.amount : sum, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay transacciones</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{tx.client}</p>
                        <p className="text-sm text-gray-500">{tx.matter}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                        <Badge variant={getStatusColor(tx.status) as any}>
                          {tx.status === 'paid' ? 'Pagado' : tx.status === 'pending' ? 'Pendiente' : 'Vencido'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}