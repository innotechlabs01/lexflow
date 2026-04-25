import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import OnboardingForm from './_components/onboarding-form'
import type { UserRole } from '@/types/auth'

export default async function OnboardingPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const clerkId = user.id
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })

  const validRoles: UserRole[] = ['super_admin', 'admin', 'lawyer', 'client']
  if (existingUser && existingUser.role && validRoles.includes(existingUser.role as UserRole)) {
    redirect('/dashboard')
  }

  const email = user.emailAddresses.find(
    (e: { id: string }) => e.id === user.primaryEmailAddressId
  )?.emailAddress || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 mb-4">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido a LexFlow</h1>
          <p className="mt-2 text-gray-600">
            Completa tu perfil para comenzar a usar la plataforma
          </p>
        </div>

        <OnboardingForm
          userId={user.id}
          userEmail={email}
          userName={user.fullName || user.username || ''}
        />
      </div>
    </div>
  )
}
