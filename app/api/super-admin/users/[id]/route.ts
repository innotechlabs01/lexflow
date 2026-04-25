import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

function getClient() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  return createClient({ url: url || 'file:local.db', authToken: token })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params
  const client = getClient()
  
  try {
    const body = await req.json()
    const { email, firstName, lastName, password, role, organizationId, status } = body

    const userResult = await client.execute({
      sql: 'SELECT id, clerk_id, organization_id FROM users WHERE id = ?',
      args: [userId]
    })

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]
    const clerkId = user.clerk_id as string
    const currentOrgId = user.organization_id as string

    if (organizationId !== undefined && organizationId !== currentOrgId) {
      const orgResult = await client.execute({
        sql: 'SELECT employee_count FROM organizations WHERE id = ?',
        args: [organizationId]
      })

      if (!orgResult.rows || orgResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Organización no encontrada' },
          { status: 404 }
        )
      }

      const employeeCount = orgResult.rows[0].employee_count as number

      const userCountResult = await client.execute({
        sql: 'SELECT count(*) as count FROM users WHERE organization_id = ? AND status = ? AND id != ?',
        args: [organizationId, 'active', userId]
      })
      const currentUsers = Number(userCountResult.rows[0]?.count || 0)

      if (currentUsers >= employeeCount) {
        return NextResponse.json(
          { 
            error: `Has alcanzado el límite de ${employeeCount} usuarios para esta organización.`,
            limitReached: true 
          },
          { status: 400 }
        )
      }
    }

    let clerkData: Record<string, unknown> = {}

    if (email || firstName || lastName) {
      const nameParts = (firstName || '').split(' ')
      const lastNameParts = (lastName || '').split(' ')
      
      if (email) clerkData.email_address = [email]
      if (firstName) clerkData.first_name = firstName
      if (lastName) clerkData.last_name = lastName
    }

    if (role || organizationId || status) {
      clerkData.public_metadata = {}
      if (role) (clerkData.public_metadata as Record<string, unknown>).role = role
      if (organizationId) {
        const orgResult = await client.execute({
          sql: 'SELECT name FROM organizations WHERE id = ?',
          args: [organizationId]
        })
        const orgName = orgResult.rows[0]?.name as string
        ;(clerkData.public_metadata as Record<string, unknown>).organizationId = organizationId
        ;(clerkData.public_metadata as Record<string, unknown>).organizationName = orgName
      }
    }

    if (Object.keys(clerkData).length > 0) {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY
      if (clerkSecretKey && clerkId) {
        const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clerkData),
        })

        if (!clerkResponse.ok) {
          const errorData = await clerkResponse.json()
          return NextResponse.json(
            { error: errorData.errors?.[0]?.message || 'Error al actualizar usuario en Clerk' },
            { status: 422 }
          )
        }
      }
    }

    if (password && password.length >= 8) {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY
      if (clerkSecretKey && clerkId) {
        const passwordResponse = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        })

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json()
          return NextResponse.json(
            { error: errorData.errors?.[0]?.message || 'Error al actualizar contraseña' },
            { status: 422 }
          )
        }
      }
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim()

    const roleValue = role !== undefined ? role : null
    const orgIdValue = organizationId !== undefined ? organizationId : null
    const statusValue = status !== undefined ? status : null
    const emailValue = email !== undefined ? email : null
    const nameValue = fullName || null

    await client.execute({
      sql: `UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        organization_id = COALESCE(?, organization_id),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?`,
      args: [
        nameValue,
        emailValue,
        roleValue,
        orgIdValue,
        statusValue,
        Math.floor(Date.now() / 1000),
        userId
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado correctamente',
    })
  } catch (error) {
    console.error('[API] Error updating user:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params
  const client = getClient()
  
  try {
    const userResult = await client.execute({
      sql: 'SELECT id, name FROM users WHERE id = ?',
      args: [userId]
    })

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]
    const userName = user.name as string

    await client.execute({
      sql: 'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
      args: ['inactive', Math.floor(Date.now() / 1000), userId]
    })

    return NextResponse.json({
      success: true,
      message: `Usuario "${userName}" desactivado correctamente`,
    })
  } catch (error) {
    console.error('[API] Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Error al desactivar usuario. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}