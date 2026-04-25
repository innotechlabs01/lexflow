import { createClient } from '@libsql/client'
import type { AuthContext } from '@/lib/auth/middleware'

let _client: any = null

function getUserClient() {
  if (!_client && typeof window === 'undefined') {
    const url = process.env.TURSO_DATABASE_URL
    const token = process.env.TURSO_AUTH_TOKEN
    
    if (!url || url === 'undefined') {
      _client = createClient({ url: 'file:local.db' })
    } else {
      _client = createClient({ url, authToken: token })
    }
  }
  return _client
}

export interface UserWithOrg {
  id: string
  clerkId: string
  organizationId: string | null
  organizationName: string | null
  role: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  status: string
  lastLoginAt: Date | null
  createdAt: Date
}

export interface MemberWithStats {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: Date | null
  caseCount: number
  specialty?: string | null
  lawyerId?: string | null
}

function getRows<T>(result: any): T[] {
  return (result?.rows || []) as T[]
}

export async function getOrganizationMembers(ctx: AuthContext): Promise<MemberWithStats[]> {
  const client = getUserClient()
  if (!client || !ctx.organizationId) return []
  
  const query = `SELECT u.id, u.name, u.email, u.role, u.status, u.last_login_at,
    l.id as lawyer_id,
    l.specialty,
    (SELECT count(*) FROM cases WHERE lawyer_id IN (SELECT id FROM lawyers WHERE user_id = u.id)) as case_count
    FROM users u 
    LEFT JOIN lawyers l ON l.user_id = u.id
    WHERE u.organization_id = '${ctx.organizationId}'
    ORDER BY u.name ASC`
  
  const result = await client.execute(query)
  const rows = getRows<{ id: string, name: string, email: string, role: string, status: string, last_login_at: number | null, lawyer_id: string | null, specialty: string | null, case_count: number }>(result)

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    status: r.status,
    lastLogin: r.last_login_at ? new Date(r.last_login_at * 1000) : null,
    caseCount: r.case_count,
    specialty: r.specialty,
    lawyerId: r.lawyer_id,
  }))
}

export async function getAllUsersForSuperAdmin(ctx: AuthContext): Promise<UserWithOrg[]> {
  const client = getUserClient()
  if (!client || !ctx.isSuperAdmin) return []
  
  const query = `SELECT u.id, u.clerk_id, u.organization_id, o.name as organization_name, u.role, u.name, u.email, u.phone, u.avatar_url, u.status, u.last_login_at, u.created_at
    FROM users u 
    LEFT JOIN organizations o ON u.organization_id = o.id
    ORDER BY u.created_at DESC
    LIMIT 100`
  
  const result = await client.execute(query)
  const rows = getRows<{ id: string, clerk_id: string, organization_id: string | null, organization_name: string | null, role: string, name: string, email: string, phone: string | null, avatar_url: string | null, status: string, last_login_at: number | null, created_at: number }>(result)

  return rows.map(r => ({
    id: r.id,
    clerkId: r.clerk_id,
    organizationId: r.organization_id,
    organizationName: r.organization_name,
    role: r.role,
    name: r.name,
    email: r.email,
    phone: r.phone,
    avatarUrl: r.avatar_url,
    status: r.status,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at * 1000) : null,
    createdAt: new Date(r.created_at * 1000),
  }))
}

export async function getUsers(ctx: AuthContext): Promise<{ users: Array<{ id: string; name: string; email: string }> }> {
  const client = getUserClient()
  if (!client || !ctx.organizationId) return { users: [] }
  
  const query = `SELECT id, name, email FROM users WHERE organization_id = '${ctx.organizationId}' ORDER BY name ASC`
  const result = await client.execute(query)
  const rows = getRows<{ id: string; name: string; email: string }>(result)

  return { users: rows }
}