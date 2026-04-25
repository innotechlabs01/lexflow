import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { logApiAudit } from '@/lib/data/audit'

// GET /api/tasks - List tasks
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const caseId = searchParams.get('caseId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build conditions
    const conditions = []

    // Filter by assigned user (unless admin)
    if (!ctx.isAdmin && !ctx.isSuperAdmin) {
      conditions.push(eq(tasks.assignedTo, ctx.userId))
    }

    if (status) {
      conditions.push(eq(tasks.status, status as any))
    }

    if (priority) {
      conditions.push(eq(tasks.priority, priority as any))
    }

    if (caseId) {
      conditions.push(eq(tasks.caseId, caseId))
    }

    // Query tasks
    const results = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      data: results,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create task
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

    const newTask = await db
      .insert(tasks)
      .values({
        ...body,
        createdBy: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    await logApiAudit(req, 'task', newTask[0].id, 'create', undefined, { title: body.title })

    return NextResponse.json(newTask[0], { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}