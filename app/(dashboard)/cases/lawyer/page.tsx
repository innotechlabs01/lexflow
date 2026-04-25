'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Gavel,
  FolderOpen,
  Receipt,
  TrendingUp,
  Search,
  Bell,
  Settings,
  Plus,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  List,
  Grid3X3,
  Building2,
  Scale,
  FileText,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const cases = [
  {
    id: '1',
    caseNumber: 'LF-2024-0082',
    client: {
      name: 'Aether Media Corp',
      initials: 'AM',
    },
    type: 'Corporate Litigation',
    caseType: 'Commercial Law',
    status: 'active',
    lastUpdate: 'Oct 24, 2024',
    lastUpdateTime: '2:45 PM by S. Chen',
  },
  {
    id: '2',
    caseNumber: 'LF-2024-0105',
    client: {
      name: 'Robert Kincaid',
      initials: 'RK',
    },
    type: 'Intellectual Property',
    caseType: 'Copyright',
    status: 'hearing',
    lastUpdate: 'Today',
    hearingTime: '10:00 AM',
  },
  {
    id: '3',
    caseNumber: 'LF-2023-0941',
    client: {
      name: 'Zenith Logistics',
      initials: 'ZL',
    },
    type: 'Contract Dispute',
    caseType: 'Civil Law',
    status: 'urgent',
    lastUpdate: '1 hour ago',
    deadline: 'Filing Deadline approaching',
  },
  {
    id: '4',
    caseNumber: 'LF-2023-0422',
    client: {
      name: 'Starlight Wellness',
      initials: 'SW',
    },
    type: 'Compliance Audit',
    caseType: 'Regulatory',
    status: 'closed',
    lastUpdate: 'Oct 12, 2024',
    finalNote: 'Final Documentation Sent',
  },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-blue-100 text-blue-700' },
  hearing: { label: 'Hearing', className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 animate-pulse' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-600' },
}

const filters = [
  { id: 'status', label: 'Status' },
  { id: 'caseType', label: 'Case Type' },
  { id: 'assignee', label: 'Assignee' },
]

export default function LawyerCasesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 26

  return (
    <div className="min-h-screen bg-background">
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-50 border-r border-slate-100 flex flex-col gap-2 p-4 z-40">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">LexFlow Juris</h1>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Editorial Legal Suite
            </p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-medium text-sm rounded-lg" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 shadow-sm rounded-lg transition-all cursor-pointer font-medium text-sm" href="#">
            <Gavel className="w-5 h-5" />
            <span>Matters</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-medium text-sm rounded-lg" href="#">
            <FolderOpen className="w-5 h-5" />
            <span>Documents</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-medium text-sm rounded-lg" href="#">
            <Receipt className="w-5 h-5" />
            <span>Invoicing</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer font-medium text-sm rounded-lg" href="#">
            <TrendingUp className="w-5 h-5" />
            <span>Analytics</span>
          </a>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100/50">
          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            New Case
          </Button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen relative">
        <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-xl z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                placeholder="Search cases, files, or clients..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">Julian Sterling</p>
              <p className="text-[10px] text-slate-500 font-medium">Senior Partner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              JS
            </div>
          </div>
        </header>

        <div className="pt-24 px-8 pb-12">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                <span>LexFlow</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Matters</span>
              </nav>
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Active Case Files
              </h2>
              <p className="text-slate-500 mt-2 max-w-lg leading-relaxed">
                Manage and monitor the flow of your firm's ongoing litigation and advisory matters.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Caso
              </Button>
            </div>
          </div>

          <div className="mb-8 p-1 bg-gray-50 rounded-2xl flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-sm font-medium rounded-xl shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>{filter.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              ))}
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">
                Clear filters
              </button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl shadow-sm mr-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Case #</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Client</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Case Type</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Last Updated</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-6">
                        <span className="font-bold text-slate-900">{caseItem.caseNumber}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            caseItem.status === 'urgent' ? 'bg-red-100 text-red-600' :
                            caseItem.status === 'hearing' ? 'bg-orange-100 text-orange-600' :
                            caseItem.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {caseItem.client.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{caseItem.client.name}</p>
                            <p className="text-[10px] text-slate-500">{caseItem.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-5 h-5 opacity-60" />
                          <span className="text-sm">{caseItem.caseType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${statusConfig[caseItem.status].className}`}>
                          {statusConfig[caseItem.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{caseItem.lastUpdate}</span>
                          {caseItem.lastUpdateTime && (
                            <span className="text-[10px] text-slate-400">{caseItem.lastUpdateTime}</span>
                          )}
                          {caseItem.hearingTime && (
                            <span className="text-[10px] text-orange-600 font-bold">Scheduled for {caseItem.hearingTime}</span>
                          )}
                          {caseItem.deadline && (
                            <span className="text-[10px] text-red-600">{caseItem.deadline}</span>
                          )}
                          {caseItem.finalNote && (
                            <span className="text-[10px] text-slate-400">{caseItem.finalNote}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 italic">Showing 1 to 10 of 254 cases</p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-1 text-slate-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 font-bold text-xs hover:bg-white">
                  26
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">42</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Hearings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">128</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unfiled Documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">$12.4k</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Retainers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
