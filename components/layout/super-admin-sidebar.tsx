'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  LayoutDashboard,
  Building,
  Users,
  Shield,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  CreditCard,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { SUPER_ADMIN_LINKS } from '@/lib/constants'

interface SuperAdminSidebarProps {
  className?: string
}

const PRIMARY_COLOR = '#004ac6'
const PRIMARY_HOVER = '#0038a3'

export function SuperAdminSidebar({ className }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { user } = useUser()
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden text-gray-900 dark:text-white"
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
          isDark
            ? 'bg-sidebar-bg text-white'
            : 'bg-white text-gray-900 border-r border-gray-200',
          collapsed ? 'w-16' : 'w-64',
          'md:w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
        role="navigation"
        aria-label="Navegación Super Admin"
      >
        <div className={cn(
          'flex h-16 items-center justify-between border-b px-4',
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}>
          {!collapsed && (
            <Link href="/super-admin" className="flex items-center gap-2" onClick={closeMobile}>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">LexFlow</span>
                <span
                  className="text-xs"
                  style={{ color: isDark ? '#9ca3af' : '#7c3aed' }}
                >
                  Super Admin
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg mx-auto"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {!collapsed && (
            <div className="mb-4 px-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: isDark ? 'rgba(0, 74, 198, 0.2)' : '#e0e7ff',
                  color: PRIMARY_COLOR
                }}
              >
                <Activity className="h-3 w-3" />
                Panel de Administración
              </span>
            </div>
          )}

          <div className="space-y-1">
            {!collapsed && (
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
              >
                Administración
              </span>
            )}
            {SUPER_ADMIN_LINKS.map((link) => {
              const Icon = getIcon(link.icon)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'bg-primary text-black #1f19ff shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-primary hover:red-500',
                    collapsed && 'justify-center px-2'
                  )}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  <Icon
                    className={cn('h-5 w-5')}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-25 left-0 right-0 px-4 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full justify-center transition-all duration-200',
              isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            )}
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

        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 border-t p-4',
            isDark ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: isDark ? 'rgba(0, 74, 198, 0.2)' : '#e0e7ff',
                  color: PRIMARY_COLOR
                }}
              >
                <Shield className="h-3 w-3" />
                Super Admin
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
                  {user?.fullName || user?.username || 'Admin'}
                </span>
                <span
                  className="text-xs truncate"
                  style={{ color: isDark ? '#9ca3af' : '#7c3aed' }}
                >
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
    UserCog,
    CreditCard,
    Building,
    FileText,
    Settings,
  }
  return icons[iconName] || LayoutDashboard
}