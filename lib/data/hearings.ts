import { db } from '@/lib/db'
import { hearings, cases } from '@/lib/db/schema'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'
import type { HearingType, HearingStatus } from '@/types/auth'

export interface HearingWithCase {
  id: string
  caseId: string
  hearingType: HearingType | null
  court: string | null
  courtroom: string | null
  judgeName: string | null
  hearingDate: Date
  durationMinutes: number
  location: string | null
  virtualLink: string | null
  status: HearingStatus
  notes: string | null
  observations: string | null
  outcome: string | null
  createdAt: Date
  updatedAt: Date
  case?: {
    id: string
    title: string
    caseNumber: string | null
  } | null
}

export interface HearingsQueryOptions {
  startDate?: Date
  endDate?: Date
  status?: HearingStatus
  caseId?: string
  limit?: number
  offset?: number
}

export interface HearingsResult {
  hearings: HearingWithCase[]
  total: number
}

export async function getHearings(
  ctx: AuthContext,
  options: HearingsQueryOptions = {}
): Promise<HearingsResult> {
  const { startDate, endDate, status, caseId, limit = 50, offset = 0 } = options

  const conditions = []

  if (status) {
    conditions.push(eq(hearings.status, status))
  }

  if (caseId) {
    conditions.push(eq(hearings.caseId, caseId))
  }

  if (startDate) {
    conditions.push(gte(hearings.hearingDate, startDate))
  }

  if (endDate) {
    conditions.push(lte(hearings.hearingDate, endDate))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const results = await db.query.hearings.findMany({
    where: whereClause,
    with: {
      case: {
        columns: {
          id: true,
          title: true,
          caseNumber: true,
        },
      },
    },
    orderBy: hearings.hearingDate,
    limit,
    offset,
  })

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(hearings)
    .where(whereClause)

  const total = Number(countResult[0]?.count) || 0

  return {
    hearings: results as HearingWithCase[],
    total,
  }
}

export async function getUpcomingHearings(
  ctx: AuthContext,
  options: { limit?: number } = {}
) {
  const { limit = 10 } = options
  const now = new Date()

  const results = await db.query.hearings.findMany({
    where: and(
      eq(hearings.status, 'scheduled'),
      gte(hearings.hearingDate, now)
    ),
    with: {
      case: {
        columns: {
          id: true,
          title: true,
          caseNumber: true,
        },
      },
    },
    orderBy: hearings.hearingDate,
    limit,
  })

  return results as HearingWithCase[]
}

export async function getHearingById(
  ctx: AuthContext,
  hearingId: string
): Promise<HearingWithCase | null> {
  const result = await db.query.hearings.findFirst({
    where: eq(hearings.id, hearingId),
    with: {
      case: {
        columns: {
          id: true,
          title: true,
          caseNumber: true,
        },
      },
    },
  })

  return result as HearingWithCase | null
}

export async function createHearing(
  ctx: AuthContext,
  data: {
    caseId: string
    hearingType?: HearingType
    court?: string
    courtroom?: string
    judgeName?: string
    hearingDate: Date
    durationMinutes?: number
    location?: string
    virtualLink?: string
    notes?: string
  }
) {
  const result = await db
    .insert(hearings)
    .values({
      caseId: data.caseId,
      hearingType: data.hearingType,
      court: data.court,
      courtroom: data.courtroom,
      judgeName: data.judgeName,
      hearingDate: data.hearingDate,
      durationMinutes: data.durationMinutes || 60,
      location: data.location,
      virtualLink: data.virtualLink,
      notes: data.notes,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return result[0]
}

export async function updateHearingStatus(
  ctx: AuthContext,
  hearingId: string,
  status: HearingStatus
) {
  const result = await db
    .update(hearings)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(hearings.id, hearingId))
    .returning()

  return result[0]
}

export async function getHearingsByMonth(
  ctx: AuthContext,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  return getHearings(ctx, {
    startDate,
    endDate,
    limit: 100,
  })
}
