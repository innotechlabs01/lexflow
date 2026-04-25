import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients, users } from '@/lib/db/schema'
import { eq, and, like, or, desc } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { logApiAudit } from '@/lib/data/audit'

// GET /api/clients - List clients
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build conditions
    const conditions = []

    // Filter by organization (unless super admin)
    if (!ctx.isSuperAdmin && ctx.organizationId) {
      conditions.push(eq(clients.organizationId, ctx.organizationId))
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(clients.documentNumber, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
    }

    // Query clients with user data
    const results = await db
      .select({
        client: clients,
        user: users,
      })
      .from(clients)
      .leftJoin(users, eq(clients.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset)

    const data = results.map((r: any) => ({
      ...r.client,
      userName: r.user?.name ?? null,
      userEmail: r.user?.email ?? null,
    }))

    return NextResponse.json({
      data,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create client
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
    const { name, email, phone, assignedLawyerId, ...clientData } = body

    // Map camelCase to snake_case for clients table
    const clientFields = {
      documentType: clientData.documentType,
      documentNumber: clientData.documentNumber,
      address: clientData.address,
      city: clientData.city,
      department: clientData.department,
      occupation: clientData.occupation,
      referredBy: clientData.referredBy,
      notes: clientData.notes,
    }

    // Create user record for the client first
    const newUser = await db
      .insert(users)
      .values({
        clerkId: `client_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        organizationId: ctx.organizationId,
        role: 'client',
        name: name || '',
        email: email || '',
        phone: phone || '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Then create client record linked to user
    const newClient = await db
      .insert(clients)
      .values({
        documentType: clientFields.documentType,
        documentNumber: clientFields.documentNumber,
        address: clientFields.address,
        city: clientFields.city,
        department: clientFields.department,
        occupation: clientFields.occupation,
        referredBy: clientFields.referredBy,
        notes: clientFields.notes,
        organizationId: ctx.organizationId,
        userId: newUser[0].id,
        lawyerId: assignedLawyerId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    await logApiAudit(req, 'client', newClient[0].id, 'create', undefined, { 
      name, 
      email, 
      documentNumber: clientFields.documentNumber 
    })

    return NextResponse.json(
      { ...newClient[0], name, email, phone },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}