import { getAuthContext } from '@/lib/auth/middleware'
import { getHearingsByMonth } from '@/lib/data/hearings'
import { getCases } from '@/lib/data/cases'
import { redirect } from 'next/navigation'
import CalendarPageClient from './CalendarPageClient'

export default async function CalendarPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [{ hearings }, casesResult] = await Promise.all([
    getHearingsByMonth(ctx, year, month),
    getCases(ctx, { limit: 100 }),
  ])

  const formattedHearings = hearings.map((h) => {
    const hearingDate = new Date(h.hearingDate)
    return {
      id: h.id,
      title: h.case?.title || 'Audiencia',
      caseName: h.case?.title || 'Sin caso',
      date: hearingDate.toISOString().split('T')[0],
      time: hearingDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      duration: h.durationMinutes,
      court: h.court || '',
      location: h.location || h.courtroom || '',
      type: h.hearingType || 'other',
      status: h.status,
      virtualLink: h.virtualLink || undefined,
    }
  })

  return (
    <CalendarPageClient
      initialHearings={formattedHearings}
      initialYear={year}
      initialMonth={month}
      cases={casesResult.cases.map(c => ({ id: c.id, title: c.title }))}
    />
  )
}
