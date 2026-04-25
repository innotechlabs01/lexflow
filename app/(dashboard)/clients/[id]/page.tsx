import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Briefcase, FileText, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { getAuthContext } from '@/lib/auth/middleware'
import { getClientById } from '@/lib/data/clients'
import { getCases } from '@/lib/data/cases'
import { getDocuments } from '@/lib/data/documents'
import { ClientDocumentsSection } from './client-documents'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' }> = {
  open: { label: 'Abierto', variant: 'secondary' },
  in_progress: { label: 'En Progreso', variant: 'success' },
  hearing: { label: 'Audiencia', variant: 'warning' },
  closed: { label: 'Cerrado', variant: 'secondary' },
}

const typeConfig: Record<string, string> = {
  labor: 'Laboral',
  civil: 'Civil',
  criminal: 'Penal',
  family: 'Familia',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getAuthContext()

  if (!ctx) {
    notFound()
  }

  const client = await getClientById(ctx, id)

  if (!client) {
    notFound()
  }

  const { cases: clientCases } = await getCases(ctx, {
    filters: { clientId: id },
    limit: 10,
  })

  const clientName = client.name || 'Cliente sin nombre'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary-100 text-primary-600 text-xl">
                {clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
              <p className="text-gray-500">
                {client.documentType}: {client.documentNumber}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Casos
              </CardTitle>
              <Link href={`/cases?clientId=${client.id}`}>
                <Button variant="outline" size="sm">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientCases.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay casos para este cliente</p>
                ) : (
                  clientCases.map((caseItem: any) => (
                    <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{caseItem.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{caseItem.caseNumber}</span>
                            <span>•</span>
                            <span>{typeConfig[caseItem.caseType] || caseItem.caseType}</span>
                          </div>
                        </div>
                        <Badge variant={statusConfig[caseItem.status]?.variant || 'secondary'}>
                          {statusConfig[caseItem.status]?.label || caseItem.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <ClientDocumentsSection clientId={client.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-primary-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">{client.address}</p>
                    {(client.city || client.department) && (
                      <p className="text-sm text-gray-500">
                        {[client.city, client.department].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.occupation && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Ocupación</p>
                  <p className="text-gray-900">{client.occupation}</p>
                </div>
              )}
              {client.referredBy && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Referido por</p>
                  <p className="text-gray-900">{client.referredBy}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Creado por ti
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-500">Cliente desde {new Date(client.createdAt).toLocaleDateString('es-CO')}</p>
              </div>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}