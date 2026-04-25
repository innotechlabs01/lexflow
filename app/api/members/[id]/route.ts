import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lawyers, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: memberId } = await params
    const body = await req.json()
    const { specialty, name, email } = body

    const member = await db.query.users.findFirst({
      where: eq(users.id, memberId),
      with: {
        lawyer: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
    }

    if (name || email) {
      await db
        .update(users)
        .set({
          name: name || member.name,
          email: email || member.email,
        })
        .where(eq(users.id, memberId))
    }

    if (member.role === 'lawyer' && member.lawyer?.id) {
      await db
        .update(lawyers)
        .set({
          specialty: specialty || null,
        })
        .where(eq(lawyers.id, member.lawyer.id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}