import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { UserRole } from '@/types/auth'

export interface AuthContext {
  userId: string
  organizationId: string | null
  role: UserRole
  isSuperAdmin: boolean
  isAdmin: boolean
  isLawyer: boolean
  isClient: boolean
}

/**
 * Get the current authenticated user's context
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return null
  }

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      organization: true,
    },
  })

  // If user doesn't exist in our database yet, create them
  if (!user) {
    const newUser = await createUserFromClerk(clerkId)
    if (!newUser) {
      return null
    }
    return {
      userId: newUser.id,
      organizationId: newUser.organizationId,
      role: newUser.role as UserRole,
      isSuperAdmin: newUser.role === 'super_admin',
      isAdmin: newUser.role === 'admin' || newUser.role === 'super_admin',
      isLawyer: newUser.role === 'lawyer' || newUser.role === 'admin' || newUser.role === 'super_admin',
      isClient: newUser.role === 'client',
    }
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role as UserRole,
    isSuperAdmin: user.role === 'super_admin',
    isAdmin: user.role === 'admin' || user.role === 'super_admin',
    isLawyer: user.role === 'lawyer' || user.role === 'admin' || user.role === 'super_admin',
    isClient: user.role === 'client',
  }
}

/**
 * Create a new user from Clerk authentication
 */
async function createUserFromClerk(clerkId: string) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Get organization ID from Clerk's organization membership (using type assertion for compatibility)
  let organizationId: string | null = null
  let role: UserRole = 'lawyer'

  // Access organizationMemberships using bracket notation to avoid TypeScript errors
  const memberships = (clerkUser as unknown as Record<string, unknown>).organizationMemberships as Array<{
    organization: { id: string }
    role: string
  }> | undefined

  // Check if user is in an organization
  if (memberships && memberships.length > 0) {
    const orgMembership = memberships[0]
    organizationId = orgMembership.organization.id

    // Map Clerk role to our role
    const clerkRole = orgMembership.role
    if (clerkRole === 'org:super_admin') {
      role = 'super_admin'
    } else if (clerkRole === 'org:admin') {
      role = 'admin'
    } else if (clerkRole === 'org:member') {
      role = 'client'
    } else {
      role = 'lawyer'
    }
  }

  // Get email from Clerk
  const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? ''

  // Insert user into database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId,
      organizationId,
      role,
      name: clerkUser.fullName ?? clerkUser.username ?? 'Usuario',
      email,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
      avatarUrl: clerkUser.imageUrl,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return newUser
}

/**
 * Check if user can access a specific resource
 */
export async function canAccess(
  resource: string,
  organizationId?: string
): Promise<boolean> {
  const ctx = await getAuthContext()

  if (!ctx) {
    return false
  }

  // Super admin can access everything
  if (ctx.isSuperAdmin) {
    return true
  }

  // Check organization access
  if (organizationId && ctx.organizationId !== organizationId) {
    return false
  }

  // Client can only access their own resources
  if (ctx.isClient) {
    const clientResources = ['cases', 'documents', 'notifications']
    return clientResources.includes(resource)
  }

  return true
}

/**
 * Check if user can manage a specific resource
 */
export async function canManage(
  resource: string,
  organizationId?: string
): Promise<boolean> {
  const ctx = await getAuthContext()

  if (!ctx) {
    return false
  }

  // Only super_admin can manage organizations
  if (resource === 'organizations') {
    return ctx.isSuperAdmin
  }

  // Super admin can manage everything
  if (ctx.isSuperAdmin) {
    return true
  }

  // Check organization access
  if (organizationId && ctx.organizationId !== organizationId) {
    return false
  }

  // Client cannot manage anything
  if (ctx.isClient) {
    return false
  }

  // Lawyer and Admin can manage most resources
  const manageableResources = ['cases', 'clients', 'documents', 'hearings', 'tasks', 'notifications']
  return manageableResources.includes(resource)
}

/**
 * Filter data by organization (RLS simulation)
 */
export function filterByOrganization<T extends { organizationId: string | null }>(
  data: T[],
  ctx: AuthContext
): T[] {
  if (ctx.isSuperAdmin) {
    return data
  }
  return data.filter((item) => item.organizationId === ctx.organizationId)
}

/**
 * Get user's organization ID (throws if not available)
 */
export async function requireOrganizationId(): Promise<string> {
  const ctx = await getAuthContext()

  if (!ctx) {
    throw new Error('Unauthorized')
  }

  if (!ctx.organizationId) {
    throw new Error('User is not associated with an organization')
  }

  return ctx.organizationId
}

/**
 * Require a specific role
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<AuthContext> {
  const ctx = await getAuthContext()

  if (!ctx) {
    throw new Error('Unauthorized')
  }

  if (!allowedRoles.includes(ctx.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return ctx
}

/**
 * Get dashboard redirect path based on role
 */
export function getDashboardPath(role: string | null): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin'
    case 'admin':
    case 'lawyer':
      return '/dashboard'
    case 'client':
      return '/portal'
    default:
      return '/dashboard'
  }
}