import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that don't require authentication
const publicRoutes = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/about',
  '/api/public(.*)',
  '/api/webhooks(.*)',
  '/api/super-admin/stats',
  '/api/super-admin/invite-admin',
  '/api/super-admin/all-users',
  '/api/lawyers',
  '/api/clients',
])

// Routes that require super admin role
const superAdminRoutes = createRouteMatcher([
  '/super-admin(.*)',
  '/api/admin(.*)',
])

// Routes that require organization admin role
const adminRoutes = createRouteMatcher([
  '/settings/organization(.*)',
  '/settings/members(.*)',
  '/settings/billing(.*)',
])

// Routes for client portal (limited access)
const clientRoutes = createRouteMatcher([
  '/portal(.*)',
  '/my-cases(.*)',
  '/my-documents(.*)',
])

function getUserRole(authObj: any): string | null {
  const sessionClaims = authObj.sessionClaims as any

  // 1. Revisar publicMetadata del usuario
  const publicMetadata = sessionClaims?.metadata as { role?: string } | undefined
  let role = publicMetadata?.role as string | undefined

  // 2. Si no hay metadata, usar el slug de la organización
  const orgSlug = sessionClaims?.o?.slg as string || authObj.orgSlug as string

  // Si el slug contiene "super_admin", es super_admin
  if (!role && orgSlug && orgSlug.toLowerCase().includes('super_admin')) {
    return 'super_admin'
  }

  if (!role) {
    return 'admin'
  }

  const normalizedRole = (role || '').toLowerCase()

  if (normalizedRole === 'super_admin') {
    return 'super_admin'
  }
  if (normalizedRole === 'admin') {
    return 'admin'
  }
  if (normalizedRole === 'lawyer') {
    return 'lawyer'
  }
  if (normalizedRole === 'client') {
    return 'client'
  }

  return 'admin'
}

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth()
  const { userId, orgId } = authObj

  // Allow public routes
  if (publicRoutes(req)) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from auth object
  const role = getUserRole(authObj)

  // Check super admin routes
  if (superAdminRoutes(req) && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Check admin routes
  if (adminRoutes(req) && role !== 'super_admin' && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Redirect super_admin AWAY from regular dashboard - always redirect to super-admin
  if (role === 'super_admin') {
    const blockedPaths = ['/dashboard', '/cases', '/clients', '/documents', '/calendar', '/tasks', '/notifications', '/settings']
    const isBlockedPath = blockedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    if (isBlockedPath || req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/super-admin', req.url))
    }
  }

  // For client role, restrict to portal only
  if (role === 'client') {
    if (!req.nextUrl.pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/portal', req.url))
    }
  }

  // Redirect non-authenticated users or users without role to dashboard
  if (!role || role === 'lawyer' || role === 'admin') {
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Add organization ID to headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(req.headers)
    if (orgId) {
      requestHeaders.set('x-organization-id', orgId)
    }
    if (userId) {
      requestHeaders.set('x-user-id', userId)
    }
    if (role) {
      requestHeaders.set('x-user-role', role)
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|cur|heif|heic|webp|avif|pdf|txt|xml|wasm|webmanifest|map)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}