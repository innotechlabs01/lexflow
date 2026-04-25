import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lawyers, users, cases } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = ctx.organizationId
    
    const lawyerResult = await db.select({ count: sql<number>`count(*)` }).from(lawyers)
    const lawyerCount = Number(lawyerResult[0]?.count || 0)

    const caseCountResult = await db.select({ count: sql<number>`count(*)` }).from(cases).where(
      organizationId ? eq(cases.organizationId, organizationId) : undefined
    )
    const activeCaseCount = Number(caseCountResult[0]?.count || 0)

    return NextResponse.json([
      { label: 'Total Abogado', value: String(lawyerCount), color: 'text-primary' },
      { label: 'Casos Activos', value: String(activeCaseCount), color: 'text-purple-600' },
      { label: 'Audiencias Mes', value: '0', color: 'text-amber-600' },
    ])
  } catch (error) {
    console.error('Error fetching lawyer stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}