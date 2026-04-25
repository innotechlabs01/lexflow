import { db } from '@/lib/db'
import { cases, clients, lawyers, users, caseEvents, hearings, tasks } from '@/lib/db/schema'
import { eq, and, like, desc, isNull, sql } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'
import type { CaseStatus, CasePriority, CaseType } from '@/types/auth'

export interface CaseWithRelations {
  id: string
  title: string
  caseNumber: string | null
  internalCode: string | null
  caseType: CaseType | null
  status: CaseStatus
  priority: CasePriority
  openedAt: Date | null
  expectedClosingDate: Date | null
  closedAt: Date | null
  radicado: string | null
  createdAt: Date
  updatedAt: Date
  client: {
    id: string
    user: {
      name: string
      email: string
    } | null
  } | null
  lawyer: {
    id: string
    user: {
      name: string
      email: string
    } | null
  } | null
  _count?: {
    events: number
    hearings: number
    tasks: number
  }
}

export interface CasesFilters {
  status?: CaseStatus
  priority?: CasePriority
  caseType?: CaseType
  search?: string
  lawyerId?: string
  clientId?: string
}

export interface CasesQueryOptions {
  filters?: CasesFilters
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'openedAt' | 'caseNumber' | 'priority'
  orderDirection?: 'asc' | 'desc'
}

export interface CasesResult {
  cases: CaseWithRelations[]
  total: number
  limit: number
  offset: number
}

export async function getCases(
  ctx: AuthContext,
  options: CasesQueryOptions = {}
): Promise<CasesResult> {
  const {
    filters = {},
    limit = 20,
    offset = 0,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  } = options

  const conditions = []

  if (!ctx.isSuperAdmin && ctx.organizationId) {
    conditions.push(eq(cases.organizationId, ctx.organizationId))
  }

  if (filters.status) {
    conditions.push(eq(cases.status, filters.status))
  }

  if (filters.priority) {
    conditions.push(eq(cases.priority, filters.priority))
  }

  if (filters.caseType) {
    conditions.push(eq(cases.caseType, filters.caseType))
  }

  if (filters.search) {
    conditions.push(like(cases.title, `%${filters.search}%`))
  }

  if (filters.lawyerId) {
    conditions.push(eq(cases.lawyerId, filters.lawyerId))
  }

  if (filters.clientId) {
    conditions.push(eq(cases.clientId, filters.clientId))
  }

  const orderColumn = orderBy === 'caseNumber' ? cases.caseNumber :
                       orderBy === 'openedAt' ? cases.openedAt :
                       orderBy === 'priority' ? cases.priority :
                       orderBy === 'updatedAt' ? cases.updatedAt :
                       cases.createdAt

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const results = await db.query.cases.findMany({
    where: whereClause,
    with: {
      client: {
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      },
      lawyer: {
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: orderDirection === 'desc' ? desc(orderColumn) : orderColumn,
    limit,
    offset,
  })

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(whereClause)

  const total = Number(countResult[0]?.count) || 0

  return {
    cases: results as CaseWithRelations[],
    total,
    limit,
    offset,
  }
}

export async function getCaseById(
  ctx: AuthContext,
  caseId: string
): Promise<CaseWithRelations | null> {
  const result = await db.query.cases.findFirst({
    where: and(
      eq(cases.id, caseId),
      ctx.isSuperAdmin ? undefined : ctx.organizationId ? eq(cases.organizationId, ctx.organizationId) : isNull(cases.organizationId)
    ),
    with: {
      client: {
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      },
      lawyer: {
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!result) return null

  const [eventsCount, hearingsCount, tasksCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(caseEvents).where(eq(caseEvents.caseId, caseId)),
    db.select({ count: sql<number>`count(*)` }).from(hearings).where(eq(hearings.caseId, caseId)),
    db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.caseId, caseId)),
  ])

  return {
    ...result,
    _count: {
      events: Number(eventsCount[0]?.count) || 0,
      hearings: Number(hearingsCount[0]?.count) || 0,
      tasks: Number(tasksCount[0]?.count) || 0,
    },
  } as CaseWithRelations
}

export async function getCaseEvents(
  ctx: AuthContext,
  caseId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options

  const result = await db.query.caseEvents.findMany({
    where: eq(caseEvents.caseId, caseId),
    with: {
      createdBy: {
        columns: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: desc(caseEvents.eventDate),
    limit,
    offset,
  })

  return result
}

export async function getCaseHearings(
  ctx: AuthContext,
  caseId: string,
  options: { limit?: number } = {}
) {
  const { limit = 10 } = options

  const result = await db.query.hearings.findMany({
    where: eq(hearings.caseId, caseId),
    orderBy: desc(hearings.hearingDate),
    limit,
  })

  return result
}

export async function getCaseTasks(
  ctx: AuthContext,
  caseId: string,
  options: { limit?: number; status?: string } = {}
) {
  const { limit = 20 } = options

  const conditions = [eq(tasks.caseId, caseId)]

  const result = await db.query.tasks.findMany({
    where: and(...conditions),
    with: {
      assignedTo: {
        columns: {
          name: true,
          email: true,
        },
      },
      createdBy: {
        columns: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: desc(tasks.createdAt),
    limit,
  })

  return result
}

export async function getCaseStats(ctx: AuthContext) {
  const conditions = ctx.isSuperAdmin ? [] : ctx.organizationId ? [eq(cases.organizationId, ctx.organizationId)] : [isNull(cases.organizationId)]

  const statusCounts = await db
    .select({
      status: cases.status,
      count: sql<number>`count(*)`,
    })
    .from(cases)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(cases.status)

  const total = statusCounts.reduce((acc: any, curr: any) => acc + Number(curr.count), 0)

  return {
    total,
    byStatus: Object.fromEntries(statusCounts.map((s: any) => [s.status, Number(s.count)])),
  }
}
