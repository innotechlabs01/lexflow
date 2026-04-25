import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { SuperAdminLayout } from '@/components/layout/super-admin-layout'

function getClerkRole(authObj: any): string | null {
  const sessionClaims = authObj.sessionClaims as any

  // 1. Revisar publicMetadata
  const publicMetadata = sessionClaims?.metadata as { role?: string } | undefined
  let role = publicMetadata?.role as string | undefined

  // 2. Si no hay, usar orgSlug
  const orgSlug = sessionClaims?.o?.slg as string || authObj.orgSlug as string

  // Si el slug contiene "super_admin"
  if (!role && orgSlug && orgSlug.toLowerCase().includes('super_admin')) {
    return 'super_admin'
  }

  if (role && (role || '').toLowerCase() === 'super_admin') {
    return 'super_admin'
  }

  return null
}

export default async function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authObj = await auth()
  const { userId } = authObj

  if (!userId) {
    redirect('/sign-in')
  }

  const clerkRole = getClerkRole(authObj)

  if (clerkRole !== 'super_admin') {
    redirect('/unauthorized')
  }

  return <SuperAdminLayout>{children}</SuperAdminLayout>
}