'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  CheckSquare,
  Bell,
  Settings,
  Building,
  UserCog,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Scale,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { LAWYER_SIDEBAR_LINKS, ADMIN_SIDEBAR_LINKS, ADMIN_LINKS } from '@/lib/constants'

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
  },
  admin: {
    label: 'Administrador',
    color: 'bg-blue-100 text-blue-800',
    icon: UserCog,
  },
  lawyer: {
    label: 'Abogado',
    color: 'bg-green-100 text-green-800',
    icon: Scale,
  },
  client: {
    label: 'Cliente',
    color: 'bg-gray-100 text-gray-800',
    icon: User,
  },
}

function getRoleBadge(role: string | null | undefined) {
  if (!role) return null
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]
  if (!config) return null
  const Icon = config.icon
  return { ...config, Icon }
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { user } = useUser()

  const userRole = user?.publicMetadata?.role as string | null | undefined
  const roleBadge = getRoleBadge(userRole)

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const closeMobile = () => setMobileOpen(false)

  const isSuperAdmin = userRole === 'super_admin'
  const isAdmin = userRole === 'admin'
  const isLawyer = userRole === 'lawyer'
  const isClient = userRole === 'client'

  // Main links por rol
  const mainLinks = isAdmin
    ? ADMIN_SIDEBAR_LINKS.map(link => ({ ...link, icon: getIcon(link.icon) }))
    : isLawyer
      ? LAWYER_SIDEBAR_LINKS.map(link => ({ ...link, icon: getIcon(link.icon) }))
      : []

  // Admin links: solo para admin (lawyer no ve settings)
  // const adminLinks = isAdmin
  //   ? ADMIN_LINKS.map(link => ({ ...link, icon: getIcon(link.icon) }))
  //   : []

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden"
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar-bg text-sidebar-text transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          'md:w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2" onClick={closeMobile}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-lg font-bold text-white">L</span>
              </div>
              <span className="text-lg font-semibold">LexFlow</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 mx-auto">
              <span className="text-lg font-bold text-white">L</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {/* Main Links */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
                Principal
              </span>
            )}
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-primary #1f19ff shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary hover:red-500',
                  collapsed && 'justify-center px-2'
                )}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                <link.icon className="h-5 w-5" aria-hidden="true" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </div>

          {/* Admin Links */}
          {/* <div className="mt-6 space-y-1">
            {!collapsed && (
              <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
                Administración
              </span>
            )}
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                <link.icon className="h-5 w-5" aria-hidden="true" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </div> */}
        </nav>

        {/* Collapse Button - Desktop only */}
        <div className="absolute bottom-25 left-0 right-0 px-4 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Colapsar</span>
              </>
            )}
          </Button>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          {roleBadge && !collapsed && (
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', roleBadge.color)}>
                <roleBadge.Icon className="h-3 w-3" />
                {roleBadge.label}
              </span>
            </div>
          )}
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {user?.fullName || user?.username || 'Usuario'}
                </span>
                <span className="text-xs text-sidebar-muted truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function getIcon(iconName: string): React.ElementType {
  const icons: Record<string, React.ElementType> = {
    LayoutDashboard,
    Briefcase,
    Users,
    FileText,
    Calendar,
    CheckSquare,
    Bell,
    Building,
    UserCog,
    CreditCard,
    Settings,
  }
  return icons[iconName] || LayoutDashboard
}