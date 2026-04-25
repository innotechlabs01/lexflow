import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cases } from '@/lib/db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { logApiAudit } from '@/lib/data/audit'

// GET /api/cases - List cases
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build conditions
    const conditions = []

    // Filter by organization (unless super admin)
    if (!ctx.isSuperAdmin && ctx.organizationId) {
      conditions.push(eq(cases.organizationId, ctx.organizationId))
    }

    if (status) {
      conditions.push(eq(cases.status, status as any))
    }

    if (priority) {
      conditions.push(eq(cases.priority, priority as any))
    }

    if (search) {
      conditions.push(like(cases.title, `%${search}%`))
    }

    // Query cases
    const results = await db
      .select()
      .from(cases)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(cases.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalResult = await db
      .select({ count: cases.id })
      .from(cases)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return NextResponse.json({
      data: results,
      total: totalResult.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cases - Create case
export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (ctx.isClient || (!ctx.isSuperAdmin && !ctx.isLawyer && !ctx.isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const newCase = await db
      .insert(cases)
      .values({
        ...body,
        organizationId: ctx.organizationId,
        openedAt: body.openedAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    await logApiAudit(req, 'case', newCase[0].id, 'create', undefined, { title: body.title, caseNumber: body.caseNumber })

    return NextResponse.json(newCase[0], { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}