'use client'

import { LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white transition-colors rounded-xl"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">Cerrar Sesión</span>
    </button>
  )
}