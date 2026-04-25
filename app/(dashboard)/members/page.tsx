import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth/middleware'
import { getOrganizationMembers, getAllUsersForSuperAdmin } from '@/lib/data/users'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { organizations } from '@/lib/db/schema'
import { MembersSettingsClient } from './members-client'

export default async function MembersSettingsPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const members = ctx.isSuperAdmin
    ? await getAllUsersForSuperAdmin(ctx)
    : await getOrganizationMembers(ctx)

  let currentOrganizationName: string | undefined
  if (ctx.organizationId) {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.organizationId),
    })
    currentOrganizationName = org?.name
  }

  return (
    <MembersSettingsClient
      members={members}
      isSuperAdmin={ctx.isSuperAdmin}
      currentOrganizationId={ctx.organizationId || undefined}
      currentOrganizationName={currentOrganizationName}
    />
  )
}