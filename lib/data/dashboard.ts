import { getClient, isInitialized } from './db-client'
import type { AuthContext } from '@/lib/auth/middleware'

export interface DashboardStats {
  totalCases: number
  totalClients: number
  totalDocuments: number
  totalHearings: number
}

export interface RecentCase {
  id: string
  title: string
  caseNumber: string | null
  status: string
  priority: string
  clientName: string | null
  updatedAt: Date
}

export interface UpcomingHearing {
  id: string
  caseId: string
  caseTitle: string
  hearingDate: Date
  court: string | null
  hearingType: string | null
}

export interface PendingTask {
  id: string
  title: string
  caseTitle: string | null
  dueDate: Date | null
  priority: string
  status: string
}

export interface OrganizationStats {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  logoUrl: string | null
  settings: Record<string, unknown>
  industry?: string
  employeeCount?: number
  address?: string
  city?: string
  country?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  createdAt: number
  updatedAt: number
  userCount: number
  caseCount: number
  clientCount: number
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId?: string
  userId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  createdAt: number
}

function countToNumber(row: any): number {
  return row ? Number(row.count || 0) : 0
}

function getRows<T>(result: any): T[] {
  return (result?.rows || []) as T[]
}

export async function getDashboardStats(ctx?: AuthContext): Promise<DashboardStats> {
  const client = getClient()
  if (!client) return { totalCases: 0, totalClients: 0, totalDocuments: 0, totalHearings: 0 }
  
  let caseCount = 0
  let clientCount = 0
  let docCount = 0
  let hearingCount = 0

  const now = Math.floor(Date.now() / 1000)

  const casesResult = await client.execute('SELECT count(*) as count FROM cases')
  const clientsResult = await client.execute('SELECT count(*) as count FROM clients')
  const docsResult = await client.execute('SELECT count(*) as count FROM documents')
  const hearingsResult = await client.execute(`SELECT count(*) as count FROM hearings WHERE hearing_date > ${now} AND status = 'scheduled'`)
  caseCount = countToNumber(getRows<any>(casesResult)[0])
  clientCount = countToNumber(getRows<any>(clientsResult)[0])
  docCount = countToNumber(getRows<any>(docsResult)[0])
  hearingCount = countToNumber(getRows<any>(hearingsResult)[0])

  return {
    totalCases: caseCount,
    totalClients: clientCount,
    totalDocuments: docCount,
    totalHearings: hearingCount,
  }
}

export async function getRecentCases(ctx?: AuthContext, limit = 5): Promise<RecentCase[]> {
  const client = getClient()
  if (!client) return []
  
  const query = `SELECT id, title, case_number, status, priority, updated_at FROM cases ORDER BY updated_at DESC LIMIT ${limit}`
  
  const result = await client.execute(query)
  const rows = getRows<{ id: string, title: string, case_number: string | null, status: string, priority: string, updated_at: number }>(result)

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    caseNumber: r.case_number,
    status: r.status,
    priority: r.priority,
    clientName: null,
    updatedAt: new Date(r.updated_at * 1000),
  }))
}

export async function getUpcomingHearings(ctx?: AuthContext, limit = 5): Promise<UpcomingHearing[]> {
  const client = getClient()
  if (!client) return []
  
  const now = Math.floor(Date.now() / 1000)
  
  const query = `SELECT h.id, h.case_id, c.title as case_title, h.hearing_date, h.court, h.hearing_type 
    FROM hearings h 
    LEFT JOIN cases c ON h.case_id = c.id 
    WHERE h.hearing_date > ${now} AND h.status = 'scheduled'
    ORDER BY h.hearing_date ASC 
    LIMIT ${limit}`
  
  const result = await client.execute(query)
  const rows = getRows<{ id: string, case_id: string, case_title: string, hearing_date: number, court: string | null, hearing_type: string | null }>(result)

  return rows.map(r => ({
    id: r.id,
    caseId: r.case_id,
    caseTitle: r.case_title || 'Sin caso',
    hearingDate: new Date(r.hearing_date * 1000),
    court: r.court,
    hearingType: r.hearing_type,
  }))
}

export async function getPendingTasks(ctx?: AuthContext, limit = 5): Promise<PendingTask[]> {
  const client = getClient()
  if (!client) return []
  
  const query = `SELECT t.id, t.title, c.title as case_title, t.due_date, t.priority, t.status 
    FROM tasks t 
    LEFT JOIN cases c ON t.case_id = c.id 
    WHERE t.status IN ('pending', 'in_progress')
    ORDER BY t.due_date ASC 
    LIMIT ${limit}`
  
  const result = await client.execute(query)
  const rows = getRows<{ id: string, title: string, case_title: string | null, due_date: number | null, priority: string, status: string }>(result)

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    caseTitle: r.case_title,
    dueDate: r.due_date ? new Date(r.due_date * 1000) : null,
    priority: r.priority,
    status: r.status,
  }))
}

export async function getAllOrganizations(page = 1, limit = 100): Promise<OrganizationStats[]> {
  const client = getClient()
  if (!client) {
    console.warn('[DB] getAllOrganizations: No client')
    return []
  }
  
  const offset = (page - 1) * limit
  
  const query = `SELECT o.id, o.name, o.slug, o.plan, o.status, o.logo_url, o.settings,
    o.industry, o.employee_count, o.address, o.city, o.country, 
    o.contact_email, o.contact_phone, o.website, o.created_at, o.updated_at,
    (SELECT count(*) FROM users WHERE organization_id = o.id) as user_count,
    (SELECT count(*) FROM cases WHERE organization_id = o.id) as case_count,
    (SELECT count(*) FROM clients WHERE organization_id = o.id) as client_count
    FROM organizations o ORDER BY o.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`
  
  const result = await client.execute(query)
  const rows = getRows<{ 
    id: string, 
    name: string, 
    slug: string, 
    plan: string, 
    status: string, 
    logo_url: string | null,
    settings: string,
    industry: string | null,
    employee_count: number | null,
    address: string | null,
    city: string | null,
    country: string | null,
    contact_email: string | null,
    contact_phone: string | null,
    website: string | null,
    created_at: number,
    updated_at: number,
    user_count: number,
    case_count: number,
    client_count: number 
  }>(result)
  
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    plan: r.plan,
    status: r.status,
    logoUrl: r.logo_url,
    settings: JSON.parse(r.settings || '{}'),
    industry: r.industry ?? undefined,
    employeeCount: r.employee_count ?? undefined,
    address: r.address ?? undefined,
    city: r.city ?? undefined,
    country: r.country ?? undefined,
    contactEmail: r.contact_email ?? undefined,
    contactPhone: r.contact_phone ?? undefined,
    website: r.website ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    userCount: r.user_count,
    caseCount: r.case_count,
    clientCount: r.client_count,
  }))
}

export async function getSuperAdminStats(): Promise<{
  totalOrganizations: number
  totalUsers: number
  totalCases: number
  activeCases: number
}> {
  const client = getClient()
  if (!client) return { totalOrganizations: 0, totalUsers: 0, totalCases: 0, activeCases: 0 }
  
  const [orgResult, userResult, caseResult, activeCaseResult] = await Promise.all([
    client.execute('SELECT count(*) as count FROM organizations'),
    client.execute('SELECT count(*) as count FROM users'),
    client.execute('SELECT count(*) as count FROM cases'),
    client.execute("SELECT count(*) as count FROM cases WHERE status = 'in_progress'"),
  ])

  return {
    totalOrganizations: countToNumber(getRows<any>(orgResult)[0]),
    totalUsers: countToNumber(getRows<any>(userResult)[0]),
    totalCases: countToNumber(getRows<any>(caseResult)[0]),
    activeCases: countToNumber(getRows<any>(activeCaseResult)[0]),
  }
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const client = getClient()
  if (!client) return []
  
  const query = `SELECT a.id, a.action, a.entity_type as entityType, a.entity_id as entityId,
    a.user_id as userId, a.old_values as oldValues, a.new_values as newValues,
    a.created_at as createdAt
    FROM audit_logs a
    ORDER BY a.created_at DESC
    LIMIT ${limit}`
  
  const result = await client.execute(query)
  const rows = getRows<{
    id: string,
    action: string,
    entityType: string,
    entityId: string | null,
    userId: string | null,
    oldValues: string | null,
    newValues: string | null,
    createdAt: number
  }>(result)
  
  return rows.map(r => ({
    id: r.id,
    action: r.action,
    entity: r.entityType,
    entityId: r.entityId ?? undefined,
    userId: r.userId ?? undefined,
    oldValues: r.oldValues ? JSON.parse(r.oldValues) : undefined,
    newValues: r.newValues ? JSON.parse(r.newValues) : undefined,
    createdAt: r.createdAt,
  }))
}

export async function getOrganizationsByDateRange(
  period: 'week' | 'month' | 'year' = 'month',
  periodOffset: number = 0
): Promise<{ date: string; count: number }[]> {
  const client = getClient()
  if (!client) {
    console.warn('[DB] getOrganizationsByDateRange: No client')
    return []
  }
  
  const query = `SELECT id, name, created_at FROM organizations ORDER BY created_at DESC LIMIT 100`
  
  const result = await client.execute(query)
  const orgs = getRows<{ id: string; name: string; created_at: number }>(result)
  
  if (orgs.length === 0) return []
  
  const now = Date.now() / 1000
  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365
  const offsetDays = periodOffset * periodDays
  
  const endTime = now - (offsetDays * 24 * 60 * 60)
  const startTime = endTime - (periodDays * 24 * 60 * 60)
  
  const filtered = orgs.filter(o => o.created_at >= startTime && o.created_at <= endTime)
  
  const grouped: Record<string, number> = {}
  filtered.forEach(org => {
    const date = new Date(org.created_at * 1000).toISOString().split('T')[0]
    grouped[date] = (grouped[date] || 0) + 1
  })
  
  return Object.entries(grouped).map(([date, count]) => ({
    date,
    count,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getMembershipStats(): Promise<{
  active: number
  trial: number
  suspended: number
}> {
  const client = getClient()
  if (!client) return { active: 0, trial: 0, suspended: 0 }
  
  const [activeResult, trialResult, suspendedResult] = await Promise.all([
    client.execute("SELECT count(*) as count FROM organizations WHERE status = 'active'"),
    client.execute("SELECT count(*) as count FROM organizations WHERE status = 'trial'"),
    client.execute("SELECT count(*) as count FROM organizations WHERE status = 'suspended'"),
  ])

  return {
    active: countToNumber(getRows<any>(activeResult)[0]),
    trial: countToNumber(getRows<any>(trialResult)[0]),
    suspended: countToNumber(getRows<any>(suspendedResult)[0]),
  }
}

export async function getUserStats(): Promise<{
  admins: number
  lawyers: number
  clients: number
}> {
  const client = getClient()
  if (!client) return { admins: 0, lawyers: 0, clients: 0 }
  
  const [adminResult, lawyerResult, clientResult] = await Promise.all([
    client.execute("SELECT count(*) as count FROM users WHERE role = 'admin'"),
    client.execute("SELECT count(*) as count FROM users WHERE role = 'lawyer'"),
    client.execute("SELECT count(*) as count FROM users WHERE role = 'client'"),
  ])

  return {
    admins: countToNumber(getRows<any>(adminResult)[0]),
    lawyers: countToNumber(getRows<any>(lawyerResult)[0]),
    clients: countToNumber(getRows<any>(clientResult)[0]),
  }
}