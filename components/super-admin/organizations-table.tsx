'use client'

import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateOrganizationModal } from '@/components/super-admin/create-organization-modal'
import { OrganizationDetailModal } from '@/components/super-admin/organization-detail-modal'
import { EditOrganizationModal } from '@/components/super-admin/edit-organization-modal'
import { useState } from 'react'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  logoUrl: string | null
  settings: Record<string, unknown>
  // Business/organizational details
  industry?: string
  employeeCount?: number
  address?: string
  city?: string
  country?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  // Stats
  userCount: number
  caseCount: number
  clientCount: number
  createdAt: number
  updatedAt: number
}

interface OrganizationsTableProps {
  organizations: Organization[]
  setOrganizations?: React.Dispatch<React.SetStateAction<Organization[]>>
}

export function OrganizationsTable({ organizations, setOrganizations }: OrganizationsTableProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)

  // Use external setter if provided, otherwise track locally
  const handleCreateSuccess = (org: Organization) => {
    if (setOrganizations) {
      setOrganizations(prev => [...prev, org])
    }
    setDetailModalOpen(true)
  }

  return (
    <>
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="gap-2 bg-primary hover:bg-primary-700 text-primary-foreground"
      >
        <Plus className="h-4 w-4" />
        Nueva Organización
      </Button>

      <CreateOrganizationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={(org) => {
          setOrganizations?.(prev => [...prev, org])
          setSelectedOrganization(null)
          setDetailModalOpen(false)
          setCreateModalOpen(false)
        }}
      />

      {selectedOrganization && (
        <OrganizationDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          organization={selectedOrganization}
          onEdit={(orgId) => {
            setDetailModalOpen(false)
            const org = organizations.find(o => o.id === orgId)
            if (org) {
              setSelectedOrganization(org)
            }
            setEditModalOpen(true)
          }}
          onDelete={(orgId) => {
            setDetailModalOpen(false)
          }}
        />
      )}

      {selectedOrganization && (
        <EditOrganizationModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          organization={selectedOrganization}
          onSuccess={(org) => {
            setOrganizations?.(prev => prev.map(o =>
              o.id === org.id ? { ...o, ...org } : o
            ))
            setEditModalOpen(false)
            setDetailModalOpen(true)
          }}
        />
      )}
    </>
  )
}