import { Plus, Search, Filter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { getAuthContext } from '@/lib/auth/middleware'
import { getClients } from '@/lib/data/clients'
import { redirect } from 'next/navigation'

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export default async function ClientsPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const { clients: clientsList, total } = await getClients(ctx, { limit: 50 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">
            Gestiona la información de tus clientes
            {total > 0 && (
              <span className="ml-2 text-gray-400">({total} en total)</span>
            )}
          </p>
        </div>
        {(ctx.isAdmin || ctx.isLawyer) && (
          <Link href="/clients/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar clientes..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {clientsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay clientes registrados. Agrega tu primer cliente para comenzar.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientsList.map((client) => {
            const initials = client.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || '?'

            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary-100 text-primary-600">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {client.name || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {client.documentType && client.documentNumber
                            ? `${client.documentType} ${client.documentNumber}`
                            : '-'}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email || '-'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {client.city && (
                            <span className="text-xs text-gray-400">{client.city}</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDate(client.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
