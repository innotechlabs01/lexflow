import { db } from '@/lib/db'
import { clients, users } from '@/lib/db/schema'
import { eq, and, like, desc, sql } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'

export interface ClientWithRelations {
  id: string
  documentType: string | null
  documentNumber: string | null
  address: string | null
  city: string | null
  department: string | null
  occupation: string | null
  referredBy: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  // Datos del cliente (desde users, relacionado por clients.userId)
  name: string | null
  email: string | null
  phone: string | null
  // Creador (quien autenticó, mismo que userId por ahora)
  creatorName: string | null
  creatorEmail: string | null
}

export interface ClientsQueryOptions {
  search?: string
  limit?: number
  offset?: number
}

export interface ClientsResult {
  clients: ClientWithRelations[]
  total: number
  limit: number
  offset: number
}

export async function getClients(
  ctx: AuthContext,
  options: ClientsQueryOptions = {}
): Promise<ClientsResult> {
  const { search, limit = 20, offset = 0 } = options

  const conditions = []

  if (!ctx.isSuperAdmin && ctx.organizationId) {
    conditions.push(eq(clients.organizationId, ctx.organizationId))
  }

    if (search) {
    conditions.push(like(users.name, `%${search}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Join with users to get client's info
  const results = await db
    .select({
      id: clients.id,
      documentType: clients.documentType,
      documentNumber: clients.documentNumber,
      address: clients.address,
      city: clients.city,
      department: clients.department,
      occupation: clients.occupation,
      referredBy: clients.referredBy,
      notes: clients.notes,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      // Client's info from users table
      name: users.name,
      email: users.email,
      phone: users.phone,
      // Creator info
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(whereClause)
    .orderBy(desc(clients.createdAt))
    .limit(limit)
    .offset(offset)

  const mappedResults = results.map((row: any) => ({
    id: row.id,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    address: row.address,
    city: row.city,
    department: row.department,
    occupation: row.occupation,
    referredBy: row.referredBy,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    name: row.name,
    email: row.email,
    phone: row.phone,
    creatorName: row.creatorName,
    creatorEmail: row.creatorEmail,
  }))

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(whereClause)

  const total = Number(countResult[0]?.count) || 0

  return {
    clients: mappedResults,
    total,
    limit,
    offset,
  }
}

export async function getClientById(
  ctx: AuthContext,
  clientId: string
): Promise<ClientWithRelations | null> {
  const result = await db
    .select({
      id: clients.id,
      documentType: clients.documentType,
      documentNumber: clients.documentNumber,
      address: clients.address,
      city: clients.city,
      department: clients.department,
      occupation: clients.occupation,
      referredBy: clients.referredBy,
      notes: clients.notes,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      name: users.name,
      email: users.email,
      phone: users.phone,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(
      and(
        eq(clients.id, clientId),
        ctx.isSuperAdmin ? undefined : ctx.organizationId ? eq(clients.organizationId, ctx.organizationId) : undefined
      )
    )
    .limit(1)

  if (!result[0]) return null

  const row = result[0]
  return {
    id: row.id,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    address: row.address,
    city: row.city,
    department: row.department,
    occupation: row.occupation,
    referredBy: row.referredBy,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    name: row.name,
    email: row.email,
    phone: row.phone,
    creatorName: row.creatorName,
    creatorEmail: row.creatorEmail,
  }
}
