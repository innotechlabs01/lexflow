'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar className={cn(sidebarCollapsed && 'w-16')} />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64',
          'md:ml-64'
        )}
      >
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="p-4 md:p-6 pt-16 md:pt-20">
          {children}
        </main>
      </div>
    </div>
  )
}