import { NextResponse } from 'next/server'
import { getClient } from '@/lib/data/db-client'

export async function GET() {
  try {
    const client = getClient()
    if (!client) {
      return NextResponse.json({ users: [] })
    }

    const result = await client.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.status, u.organization_id, u.created_at, o.name as org_name 
            FROM users u 
            LEFT JOIN organizations o ON u.organization_id = o.id 
            ORDER BY u.created_at DESC LIMIT 100`,
      args: []
    })

    return NextResponse.json({
      users: result.rows || []
    })
  } catch (error) {
    console.error('[API] Error fetching users:', error)
    return NextResponse.json({ users: [] }, { status: 500 })
  }
}