import { db } from '@/lib/db'
import { cases, documents, caseEvents, hearings, clients, lawyers, users } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'

export interface PortalCase {
  id: string
  title: string
  caseNumber: string | null
  internalCode: string | null
  caseType: string | null
  status: string
  description: string | null
  court: string | null
  judge: string | null
  radicado: string | null
  amountInDispute: number | null
  currency: string
  openedAt: Date | null
  createdAt: Date
  updatedAt: Date
  client: {
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
}

export interface PortalDocument {
  id: string
  name: string
  documentType: string | null
  fileSize: number | null
  createdAt: Date
}

export async function getPortalCaseById(
  ctx: AuthContext,
  caseId: string
): Promise<PortalCase | null> {
  const result = await db.query.cases.findFirst({
    where: eq(cases.id, caseId),
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

  return result as PortalCase | null
}

export async function getPortalCaseEvents(
  ctx: AuthContext,
  caseId: string,
  options: { limit?: number } = {}
) {
  const { limit = 20 } = options

  const result = await db.query.caseEvents.findMany({
    where: and(
      eq(caseEvents.caseId, caseId),
      eq(caseEvents.visibility, 'client_visible')
    ),
    orderBy: desc(caseEvents.eventDate),
    limit,
  })

  return result
}

export async function getPortalCaseDocuments(
  ctx: AuthContext,
  caseId: string,
  options: { limit?: number } = {}
) {
  const { limit = 20 } = options

  const result = await db.query.documents.findMany({
    where: eq(documents.caseId, caseId),
    columns: {
      id: true,
      name: true,
      documentType: true,
      fileSize: true,
      createdAt: true,
    },
    orderBy: desc(documents.createdAt),
    limit,
  })

  return result
}

export async function getUpcomingHearings(
  ctx: AuthContext,
  options: { limit?: number } = {}
) {
  const { limit = 5 } = options

  const result = await db.query.hearings.findMany({
    where: eq(hearings.status, 'scheduled'),
    orderBy: hearings.hearingDate,
    limit,
  })

  return result
}
