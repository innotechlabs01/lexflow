import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json([])
  }
}