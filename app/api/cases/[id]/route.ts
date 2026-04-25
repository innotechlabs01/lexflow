import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cases, clients, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { logApiAudit } from '@/lib/data/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const result = await db
      .select({
        case: cases,
        client: {
          id: clients.id,
          documentType: clients.documentType,
          documentNumber: clients.documentNumber,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
        },
      })
      .from(cases)
      .leftJoin(clients, eq(cases.clientId, clients.id))
      .leftJoin(users, eq(clients.userId, users.id))
      .where(eq(cases.id, id))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const caseWithClient = {
      ...result[0].case,
      client: result[0].client,
    }

    return NextResponse.json(caseWithClient)
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (ctx.isClient || (!ctx.isSuperAdmin && !ctx.isLawyer && !ctx.isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const existingCase = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .limit(1)

    if (existingCase.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const updatedCase = await db
      .update(cases)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id))
      .returning()

    await logApiAudit(req, 'case', id, 'update', { title: existingCase[0].title }, { title: body.title })

    return NextResponse.json(updatedCase[0])
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ctx.isAdmin && !ctx.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existingCase = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .limit(1)

    if (existingCase.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    await db.delete(cases).where(eq(cases.id, id))

    await logApiAudit(req, 'case', id, 'delete', { title: existingCase[0].title })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}