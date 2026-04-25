import { db } from '@/lib/db'
import { lawyers, users, cases, clients } from '@/lib/db/schema'
import { eq, desc, sql, and, isNotNull } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'

interface RouteProps {
  params: Promise<{ id: string }>
}

export default async function LawyerClientsPage({ params }: RouteProps) {
  const { id: lawyerId } = await params
  const ctx = await getAuthContext()
  
  const organizationId = ctx?.organizationId

  const lawyer = await db.query.lawyers.findFirst({
    where: eq(lawyers.id, lawyerId),
    with: {
      user: true,
    },
  })

  if (!lawyer) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Abogado no encontrado</h1>
        <p className="text-gray-500">El abogado solicitado no existe.</p>
      </div>
    )
  }

  const clientResults = await db
    .select({
      client: clients,
      user: users,
    })
    .from(clients)
    .innerJoin(cases, eq(cases.clientId, clients.id))
    .leftJoin(users, eq(clients.userId, users.id))
    .where(
      and(
        eq(cases.lawyerId, lawyerId),
        organizationId ? eq(cases.organizationId, organizationId) : undefined,
        isNotNull(cases.clientId)
      )
    )
    .groupBy(clients.id)
    .orderBy(desc(cases.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{lawyer.user?.name || 'Abogado'}</h1>
        <p className="text-gray-500">
          {lawyer.specialty || 'Abogado'} - {lawyer.user?.email}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold text-primary">{clientResults.length}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Casos Activos</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-amber-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Audiencias</p>
          <p className="text-2xl font-bold text-amber-600">0</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientResults.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-center text-gray-500"
                  colSpan={4}
                >
                  No hay clientes asociados a este abogado
                </td>
              </tr>
            ) : (
              clientResults.map((row: any) => (
                <tr key={row.client?.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {row.user?.name || 'Cliente'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500">
                      {row.client?.documentType} {row.client?.documentNumber}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500">{row.user?.email}</p>
                    <p className="text-sm text-gray-400">{row.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Activo
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}