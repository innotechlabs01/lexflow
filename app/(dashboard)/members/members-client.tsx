'use client';

import { Plus, MoreHorizontal, Shield, UserCog, Pencil } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { MemberInviteModal } from '@/components/dashboard/settings/members/MemberInviteModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LAWYER_SPECIALTY_LABELS } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Administrador', color: 'bg-primary-100 text-primary-700' },
  lawyer: { label: 'Abogado', color: 'bg-gray-100 text-gray-700' },
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  lawyer: 'Abogado',
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Nunca'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

interface Member {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin?: Date | null
  caseCount?: number
  specialty?: string | null
  lawyerId?: string | null
}

interface MembersSettingsClientProps {
  members: Member[] | unknown[]
  isSuperAdmin: boolean
  currentOrganizationId?: string
  currentOrganizationName?: string
}

export function MembersSettingsClient({ members, isSuperAdmin, currentOrganizationId, currentOrganizationName }: MembersSettingsClientProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editSpecialty, setEditSpecialty] = useState('')
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const filteredMembers = (members as any[]).filter((member: any) =>
    member.role !== 'super_admin' && member.role !== 'client'
  )

  const handleEditClick = (member: Member) => {
    setEditingMember(member)
    setEditSpecialty(member.specialty || '')
    setEditName(member.name)
    setEditEmail(member.email)
  }

  const handleSaveEdit = async () => {
    if (!editingMember) return

    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: editSpecialty,
          name: editName,
          email: editEmail,
        }),
      })

      if (res.ok) {
        setEditingMember(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Miembros</CardTitle>
            <CardDescription>Gestiona los miembros de tu organización</CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Invitar Miembro
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead>Casos</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-100 text-primary-600 text-sm">
                          {String(member.name).split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleConfig[member.role]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {roleLabels[member.role] || member.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                      {member.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.lastLogin)}</TableCell>
                  <TableCell>{member.caseCount || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(member)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay miembros en esta organización
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles y Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
              <UserCog className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Administrador</p>
                <p className="text-sm text-gray-500">
                  Acceso completo a todas las funciones. Puede gestionar miembros, configuración y ver todos los casos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
              <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Abogado</p>
                <p className="text-sm text-gray-500">
                  Puede crear y gestionar casos, clientes y documentos. No puede acceder a configuración de la organización.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MemberInviteModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onSuccess={() => {
          window.location.reload()
        }}
        currentOrganizationId={currentOrganizationId}
        currentOrganizationName={currentOrganizationName}
      />

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Miembro</DialogTitle>
            <DialogDescription>
              Actualiza la información de {editingMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Correo electrónico"
                type="email"
              />
            </div>
            {editingMember?.role === 'lawyer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidad</label>
                <Select value={editSpecialty} onValueChange={setEditSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LAWYER_SPECIALTY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ensureUserInClerkOrganization(id: any, arg1: string, clerkRole: any, clerkSecretKey: any) {
  throw new Error('Function not implemented.');
}
