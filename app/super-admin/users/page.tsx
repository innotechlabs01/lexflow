'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Filter, MoreVertical, Shield, UserCog, Scale, User, Edit, Trash2, Loader2, Eye, EyeOff, X, Building2 } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CreateUserModal } from '@/components/super-admin/create-user-modal'
import { EditUserModal } from '@/components/super-admin/edit-user-modal'
import { DeleteUserModal } from '@/components/super-admin/delete-user-modal'

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-primary-100 text-primary-700' },
  admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
  lawyer: { label: 'Abogado', color: 'bg-green-100 text-green-700' },
  client: { label: 'Cliente', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  pending: { label: 'Pendiente', variant: 'warning' },
}

interface Organization {
  id: string
  name: string
  employeeCount: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    loadUsers()
    loadOrganizations()
  }, [])

  async function loadOrganizations() {
    try {
      const res = await fetch('/api/super-admin/stats')
      const data = await res.json()
      setOrganizations(data.organizations || [])
    } catch (err) {
      console.error('Error loading organizations:', err)
    }
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/all-users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string, userName: string) {
    setDeletingUser({ id: userId, name: userName })
  }

  async function confirmDelete() {
    if (!deletingUser) return

    setDeletingLoading(true)
    try {
      const res = await fetch(`/api/super-admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al desactivar usuario')
      }

      setDeletingUser(null)
      loadUsers()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeletingLoading(false)
    }
  }

  const roleCounts: Record<string, number> = {
    super_admin: users.filter(u => u.role === 'super_admin' && u.status === 'active').length,
    admin: users.filter(u => u.role === 'admin' && u.status === 'active').length,
    lawyer: users.filter(u => u.role === 'lawyer' && u.status === 'active').length,
    client: users.filter(u => u.role === 'client' && u.status === 'active').length,
  }

  const filteredUsers = users.filter(u => {
    if (u.status !== 'active') return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
  })

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">Gestiona todos los usuarios del sistema</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="gap-2 bg-[#004ac6] hover:bg-[#0038a3] text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo Administrador
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = roleCounts[role] || 0
          return (
            <div key={role} className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <span className="text-lg">
                    {role === 'super_admin' ? '🛡️' :
                     role === 'admin' ? '⚙️' :
                     role === 'lawyer' ? '⚖️' : '👤'}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-500">{config.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Buscar usuarios..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const config = roleConfig[user.role || 'client']
                  const name = user.name || 'Sin nombre'
                  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
                  const status = user.status || 'active'

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary-100 text-primary-600">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.org_name ? (
                          <Badge variant="outline">{user.org_name}</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">Sistema</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-700'}`}>
                          {config?.label || user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[status]?.variant === 'success' ? 'success' : statusConfig[status]?.variant === 'warning' ? 'warning' : 'secondary'}>
                          {statusConfig[status]?.label || status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Editar"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(user.id, name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          loadUsers()
        }}
      />

      <EditUserModal
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
        user={editingUser}
        onSuccess={() => {
          loadUsers()
        }}
      />

      <DeleteUserModal
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
        userName={deletingUser?.name || ''}
        onConfirm={confirmDelete}
        loading={deletingLoading}
      />
    </div>
  )
}