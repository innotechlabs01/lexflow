import { NextResponse } from 'next/server'
import { 
  getAllOrganizations, 
  getOrganizationsByDateRange, 
  getMembershipStats, 
  getUserStats 
} from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [organizations, chartData, membershipStats, userStats] = await Promise.all([
      getAllOrganizations(1, 50),
      getOrganizationsByDateRange('month', 0),
      getMembershipStats(),
      getUserStats(),
    ])

    const planCounts = {
      enterprise: organizations.filter(o => o.plan === 'enterprise').length,
      pro: organizations.filter(o => o.plan === 'pro').length,
      free: organizations.filter(o => o.plan === 'free').length,
    }

    return NextResponse.json({
      organizations,
      chartData,
      membershipStats,
      userStats,
      planCounts,
    })
  } catch (error) {
    console.error('[API] Error fetching super-admin stats:', error)
    return NextResponse.json(
      { error: 'Error fetching data' },
      { status: 500 }
    )
  }
}