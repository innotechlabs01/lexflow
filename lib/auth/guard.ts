'use server'

import { getAuthContext } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/auth'

export type AuthGuardOptions = {
  requiredRoles?: UserRole[]
  requireOrganization?: boolean
  redirectTo?: string
}

export async function requireAuth(options: AuthGuardOptions = {}) {
  const { requiredRoles, requireOrganization = false, redirectTo = '/sign-in' } = options

  const ctx = await getAuthContext()

  if (!ctx) {
    redirect(redirectTo)
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(ctx.role)
    if (!hasRole) {
      redirect('/unauthorized')
    }
  }

  if (requireOrganization && !ctx.organizationId) {
    redirect('/onboarding')
  }

  return ctx
}

export async function checkAuth() {
  return getAuthContext()
}

export async function isAuthenticated(): Promise<boolean> {
  const ctx = await getAuthContext()
  return ctx !== null
}

export async function hasRole(...roles: UserRole[]): Promise<boolean> {
  const ctx = await getAuthContext()
  if (!ctx) return false
  return roles.includes(ctx.role)
}

export async function isAdmin(): Promise<boolean> {
  return hasRole('admin', 'super_admin')
}

export async function isLawyer(): Promise<boolean> {
  return hasRole('lawyer', 'admin', 'super_admin')
}

export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin')
}
