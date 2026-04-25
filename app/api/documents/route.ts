import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents } from '@/lib/db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// GET /api/documents - List documents
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')
    const clientId = searchParams.get('clientId')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const conditions = []

    if (caseId) {
      conditions.push(eq(documents.caseId, caseId))
    }

    if (clientId) {
      conditions.push(eq(documents.clientId, clientId))
    }

    if (search) {
      conditions.push(like(documents.name, `%${search}%`))
    }

    const results = await db
      .select()
      .from(documents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      data: results,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}