'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface LawyerWithClients {
  id: string
  name: string
  email: string
  phone: string | null
  specialty: string | null
  status: string
  role: string
  caseCount: number
  clientCount: number
}

export default function LawyersClientsPage() {
  const [lawyers, setLawyers] = useState<LawyerWithClients[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLawyers()
  }, [pagination.offset, pagination.limit])

  const fetchLawyers = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/lawyers?limit=${pagination.limit}&offset=${pagination.offset}`
      )
      const data = await res.json()
      setLawyers(data.data || [])
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }))
    } catch (error) {
      console.error('Error fetching lawyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'lawyer':
        return 'Abogado'
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abogados</h1>
        <p className="text-gray-500">Consulta la cantidad de clientes por abogado</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Listado de Abogados</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-full"
                placeholder="Buscar abogado..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Abogado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Clientes Asociados
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-gray-500"
                      colSpan={4}
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : filteredLawyers.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-gray-500"
                      colSpan={4}
                    >
                      No hay abogados registrados
                    </td>
                  </tr>
                ) : (
                  filteredLawyers.map((lawyer) => (
                    <tr key={lawyer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{lawyer.name}</p>
                          <p className="text-sm text-gray-500">{lawyer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {getRoleLabel(lawyer.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {lawyer.clientCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/lawyers/${lawyer.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            Consultar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Mostrando {pagination.offset + 1} -{' '}
                {Math.min(pagination.offset + pagination.limit, pagination.total)} de{' '}
                {pagination.total} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: Math.max(0, prev.offset - prev.limit),
                    }))
                  }
                  disabled={pagination.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      offset: prev.offset + prev.limit,
                    }))
                  }
                  disabled={
                    pagination.offset + pagination.limit >= pagination.total
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}