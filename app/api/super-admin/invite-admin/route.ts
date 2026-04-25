import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

type ClerkOrgRole = 'org:admin' | 'org:member'

const SUPER_ADMIN_ORG_ID = 'org_3CaNL16xpYxSsuof7IUzeJkZ3rm'
const ADMIN_ORG_ID = 'org_3CaNM6MgMGfdwgJMn3u6MNNS25X'
const LAWYER_ORG_ID = 'org_3ConOXCmejDrJkl2VkrD2JdNYHh'
const CLIENT_ORG_ID = 'org_3CqeyRSU37Kg5zUwTzPVTl6ONre'

const ROLE_TO_ORG: Record<string, string> = {
  super_admin: SUPER_ADMIN_ORG_ID,
  admin: ADMIN_ORG_ID,
  lawyer: LAWYER_ORG_ID,
  client: CLIENT_ORG_ID,
}

function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getClient() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  return createClient({ url: url || 'file:local.db', authToken: token })
}

function mapRoleToClerkRole(role: string): ClerkOrgRole {
  if (role === 'super_admin') return 'org:admin'
  return role === 'admin' ? 'org:admin' : 'org:member'
}

async function ensureOrganizationExistsInClerk(
  organizationId: string,
  orgName: string,
  orgSlug: string,
  clerkSecretKey: string
): Promise<{ success: boolean; error?: string }> {
  const orgCheckResponse = await fetch(
    `https://api.clerk.com/v1/organizations/${organizationId}`,
    {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    }
  )

  if (orgCheckResponse.ok) {
    console.log(`[Clerk] Organization ${organizationId} ya existe en Clerk`)
    return { success: true }
  }

  if (orgCheckResponse.status !== 404) {
    const errorData = await orgCheckResponse.json()
    console.error('[Clerk] Error verificando organización:', errorData)
    return { success: false, error: 'Error verificando organización en Clerk' }
  }

  return { success: true }
}

async function ensureUserInClerkOrganization(
  userId: string,
  orgId: string,
  clerkRole: ClerkOrgRole,
  authToken: string
): Promise<{ success: boolean; alreadyMember: boolean; error?: string }> {
  const membershipsResponse = await fetch(
    `https://api.clerk.com/v1/organizations/${orgId}/memberships`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )

  if (!membershipsResponse.ok) {
    const errorData = await membershipsResponse.json()
    console.error('[Clerk] Error obteniendo membresías:', errorData)
    return { success: false, alreadyMember: false, error: 'Error verificando membresía' }
  }

  const memberships = await membershipsResponse.json()
  const alreadyMember = memberships.data?.some(
    (m: { publicUserData?: { userId: string } }) => m.publicUserData?.userId === userId
  )

  if (alreadyMember) {
    console.log(`[Clerk] Usuario ${userId} ya es miembro de organización ${orgId}`)
    return { success: true, alreadyMember: true }
  }

  const createMembershipResponse = await fetch(
    `https://api.clerk.com/v1/organizations/${orgId}/memberships`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        role: clerkRole,
      }),
    }
  )

  if (!createMembershipResponse.ok) {
    const errorData = await createMembershipResponse.json()
    console.error('[Clerk] Error creando membresía:', errorData)
    return { success: false, alreadyMember: false, error: 'Error asociando usuario a organización' }
  }

  console.log(`[Clerk] Usuario ${userId} asociado a organización ${orgId} con rol ${clerkRole}`)
  return { success: true, alreadyMember: false }
}

export async function POST(req: NextRequest) {
  const client = getClient()

  try {
    const body = await req.json()
    const { email, firstName, lastName, password, role = 'admin', organizationId, specialty } = body

    if (!email || !firstName || !lastName || !password || !organizationId) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const validRoles = ['super_admin', 'admin', 'lawyer', 'client']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    const orgResult = await client.execute({
      sql: 'SELECT id, name, slug, employee_count FROM organizations WHERE id = ?',
      args: [organizationId]
    })

    if (!orgResult.rows || orgResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    const org = orgResult.rows[0]
    const orgName = org.name as string
    const orgSlug = org.slug as string
    const employeeCount = org.employee_count as number || 0

    const userCountResult = await client.execute({
      sql: 'SELECT count(*) as count FROM users WHERE organization_id = ?',
      args: [organizationId]
    })
    const currentUsers = Number(userCountResult.rows[0]?.count || 0)

    if (currentUsers >= employeeCount) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de ${employeeCount} usuarios para esta organización.`,
          limitReached: true,
          currentUsers,
          maxUsers: employeeCount
        },
        { status: 400 }
      )
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    if (!clerkSecretKey) {
      return NextResponse.json(
        { error: 'Configuración de Clerk no disponible' },
        { status: 500 }
      )
    }

    const orgCheck = await ensureOrganizationExistsInClerk(
      ROLE_TO_ORG[role] || ADMIN_ORG_ID,
      'LexFlow Organization',
      'lexflow-org',
      clerkSecretKey
    )

    if (!orgCheck.success) {
      return NextResponse.json(
        { error: orgCheck.error || 'Error con la organización' },
        { status: 500 }
      )
    }

    const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [email],
        first_name: firstName,
        last_name: lastName,
        password,
        public_metadata: {
          role: role,
          organizationId,
          organizationName: orgName,
        },
      }),
    })

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.json()
      return NextResponse.json(
        { error: errorData.errors?.[0]?.message || 'Error al crear usuario en Clerk' },
        { status: 422 }
      )
    }

    const clerkUser = await clerkResponse.json()
    const userId = generateId()
    const now = Math.floor(Date.now() / 1000)
    const fullName = `${firstName} ${lastName}`.trim()

    await client.execute({
      sql: `INSERT INTO users (id, clerk_id, organization_id, role, name, email, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, clerkUser.id, organizationId, role, fullName, email, 'active', now, now]
    })

    const clerkRole = mapRoleToClerkRole(role)
    const clerkOrgId = ROLE_TO_ORG[role]

    if (!clerkOrgId) {
      return NextResponse.json(
        { error: `Organización no encontrada para el rol: ${role}` },
        { status: 400 }
      )
    }

    const membershipResult = await ensureUserInClerkOrganization(
      clerkUser.id,
      clerkOrgId,
      clerkRole,
      clerkSecretKey
    )

    if (!membershipResult.success && !membershipResult.alreadyMember) {
      console.warn('No se pudo asociar usuario a Clerk Organization:', membershipResult.error)
    }

    if (role === 'lawyer' && specialty) {
      const lawyerId = generateId()
      await client.execute({
        sql: `INSERT INTO lawyers (id, user_id, specialty, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        args: [lawyerId, userId, specialty, now, now]
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      userId: clerkUser.id,
      remainingSlots: employeeCount - currentUsers - 1,
    })
  } catch (error) {
    console.error('[API] Error creating user:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}