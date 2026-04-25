import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, organizations, memberships } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { UserRole } from '@/types/auth'

function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { role, orgType, orgName, inviteCode, userName, userEmail } = body

    const validRoles: UserRole[] = ['admin', 'lawyer', 'client']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    let organizationId: string | null = null

    if (orgType === 'new') {
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      organizationId = generateId()
      const now = new Date()

      await db.insert(organizations).values({
        id: organizationId,
        name: orgName,
        slug,
        plan: 'free',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })

      const membershipId = generateId()
      await db.insert(memberships).values({
        id: membershipId,
        organizationId,
        plan: 'free',
        status: 'active',
        maxLawyers: 1,
        maxClients: 10,
        maxCases: 20,
        maxStorageGb: 1,
        createdAt: now,
      })

    } else if (orgType === 'existing') {
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, inviteCode.toLowerCase()),
      })

      if (!org) {
        return NextResponse.json(
          { error: 'Organización no encontrada. Verifica el código de invitación.' },
          { status: 404 }
        )
      }
      organizationId = org.id
    }

    const userId = generateId()
    const now = new Date()

    await db.insert(users).values({
      id: userId,
      clerkId: clerkUser.id,
      organizationId,
      role,
      name: userName || clerkUser.fullName || clerkUser.username || 'Usuario',
      email: userEmail || clerkUser.emailAddresses[0]?.emailAddress || '',
      avatarUrl: clerkUser.imageUrl,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      userId,
      organizationId,
      role,
    })
  } catch (error) {
    console.error('Error en onboarding:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
