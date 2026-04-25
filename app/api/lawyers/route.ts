import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lawyers, users, cases, clients } from '@/lib/db/schema'
import { eq, desc, sql, and, isNotNull } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const organizationId = ctx?.organizationId || null

    const results = await db.query.lawyers.findMany({
      with: {
        user: true,
      },
      orderBy: desc(lawyers.createdAt),
      limit,
      offset,
    })

    const lawyersFormatted = await Promise.all(
      results.map(async (l: any) => {
        const caseCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(cases)
          .where(
            and(
              eq(cases.lawyerId, l.id),
              organizationId ? eq(cases.organizationId, organizationId) : undefined
            )
          )

        const clientCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(clients)
          .innerJoin(cases, eq(cases.clientId, clients.id))
          .where(
            and(
              eq(cases.lawyerId, l.id),
              organizationId ? eq(cases.organizationId, organizationId) : undefined,
              isNotNull(cases.clientId)
            )
          )

        return {
          id: l.id,
          name: l.user?.name || 'Sin nombre',
          email: l.user?.email || '',
          phone: l.user?.phone || null,
          specialty: l.specialty,
          status: l.user?.status || 'inactive',
          role: l.user?.role || 'lawyer',
          caseCount: Number(caseCountResult[0]?.count || 0),
          clientCount: Number(clientCountResult[0]?.count || 0),
          hearingCount: 0,
        }
      })
    )

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(lawyers)
    const total = Number(totalResult[0]?.count || 0)

    return NextResponse.json({
      data: lawyersFormatted,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}