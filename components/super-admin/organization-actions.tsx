'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddAdminModal } from '@/components/super-admin/add-admin-modal'

interface OrganizationActionsProps {
  organizationId: string
  organizationName: string
  currentUserCount: number
  maxUsers: number
}

export function OrganizationActions({ 
  organizationId, 
  organizationName,
  currentUserCount,
  maxUsers
}: OrganizationActionsProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Acciones</h3>
            <p className="text-sm text-slate-500 mt-1">
              Gestión de usuarios ({currentUserCount}/{maxUsers})
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={currentUserCount >= maxUsers}
            className="bg-[#004ac6] hover:bg-[#0038a3] text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Shield className="w-4 h-4 mr-2" />
            Añadir Administrador
          </Button>
        </div>
      </div>

      <AddAdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        organizationId={organizationId}
        organizationName={organizationName}
        currentUserCount={currentUserCount}
        maxUsers={maxUsers}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </>
  )
}