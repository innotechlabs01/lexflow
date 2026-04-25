import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  Building2,
  HelpCircle,
} from 'lucide-react'
import Link from 'next/link'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const role = user?.publicMetadata?.role as string
  const firstName = user?.firstName || 'Cliente'
  const email = user?.emailAddresses[0]?.emailAddress || ''

  if (role !== 'client' && role !== 'lawyer' && role !== 'admin') {
    redirect('/dashboard')
  }

  const navItems = [
    { href: '/portal', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/portal/cases', icon: Briefcase, label: 'Mis Casos' },
    { href: '/portal/documents', icon: FileText, label: 'Documentos' },
    { href: '/portal/calendar', icon: Calendar, label: 'Agenda' },
    { href: '/portal/messages', icon: MessageSquare, label: 'Mensajes' },
    { href: '/portal/settings', icon: Settings, label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#2563eb] rounded-lg flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LexFlow</h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Portal del Cliente
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#2563eb] flex items-center justify-center text-white font-bold text-sm">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{firstName}</p>
              <p className="text-[10px] text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Ayuda</span>
          </button>

          <form action="/sign-out" method="post">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Bienvenido, {firstName}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#2563eb] flex items-center justify-center text-white font-bold text-xs">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
