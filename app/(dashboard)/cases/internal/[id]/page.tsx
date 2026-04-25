'use client'

import { useState } from 'react'
import {
  FolderOpen,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Upload,
  Settings,
  HelpCircle,
  FileText,
  MoreVertical,
  Check,
  StickyNote,
  Building2,
  MessageSquare,
  Edit,
  Archive,
  ArrowRight,
  Plus,
  MapPin,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const caseData = {
  id: '1',
  caseNumber: '2024-00452',
  title: 'Harrison vs. Thorne Corp',
  subtitle: 'Intellectual Property Dispute - High Priority',
  status: 'active',
  type: 'IP Dispute',
  priority: 'high',
  court: 'U.S. District Court, Southern District',
  judge: 'Hon. Elena Martinez',
  client: {
    name: 'Harrison & Co. Inc',
    initials: 'HC',
    type: 'Tech Manufacturer',
  },
  billing: '$14,250.00',
  billingChange: '+12%',
  radicado: '11001400301220240012345',
  openedAt: '2024-01-15',
}

const documents = [
  {
    id: '1',
    name: 'Final_Settlement_Draft_V4.pdf',
    type: 'contract',
    owner: 'J. Doe',
    date: 'Oct 12, 2024',
    visibility: 'public',
  },
  {
    id: '2',
    name: 'Evidence_Exhibit_A.pdf',
    type: 'evidence',
    owner: 'L. Smith',
    date: 'Oct 10, 2024',
    visibility: 'confidential',
  },
  {
    id: '3',
    name: 'Motion_for_Summary_Judgment.pdf',
    type: 'motion',
    owner: 'D. Vance',
    date: 'Oct 08, 2024',
    visibility: 'confidential',
  },
]

const checklistItems = [
  {
    id: '1',
    title: 'Initial Summons Served',
    completed: true,
    completedBy: 'M. Vega',
    completedDate: 'Oct 05',
  },
  {
    id: '2',
    title: 'Review Evidence Disclosures',
    completed: true,
    completedBy: 'L. Smith',
    completedDate: 'Oct 08',
  },
  {
    id: '3',
    title: 'File Response to Motion of Dismissal',
    completed: false,
    dueIn: '2 days',
    assignee: 'D. Vance',
  },
  {
    id: '4',
    title: 'Submit Evidence Exhibits',
    completed: false,
    dueIn: '5 days',
    assignee: 'S. Jenkins',
  },
]

const teamMembers = [
  { name: 'David Vance', role: 'Lead Attorney', initials: 'DV' },
  { name: 'Sarah Jenkins', role: 'Paralegal', initials: 'SJ' },
  { name: 'Maria Vega', role: 'Associate', initials: 'MV' },
]

const tabs = [
  { id: 'resumen', label: 'Resumen', active: true },
  { id: 'documentos', label: 'Documentos', active: false },
  { id: 'timeline', label: 'Timeline', active: false },
  { id: 'tareas', label: 'Tareas', active: false },
  { id: 'notas', label: 'Notas Internas', active: false },
]

export default function LawyerCaseDetailPage() {
  const [activeTab, setActiveTab] = useState('resumen')
  const completedCount = checklistItems.filter((item) => item.completed).length
  const progress = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-8 py-3 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold tracking-tighter text-blue-900">LexFlow</span>
            <div className="hidden md:flex gap-6">
              <a className="text-slate-500 hover:text-slate-900 transition-all duration-200 hover:bg-slate-50/50 px-2 py-1" href="#">Dashboard</a>
              <a className="text-blue-700 font-semibold border-b-2 border-blue-600 px-2 py-1" href="#">Cases</a>
              <a className="text-slate-500 hover:text-slate-900 transition-all duration-200 hover:bg-slate-50/50 px-2 py-1" href="#">Billing</a>
              <a className="text-slate-500 hover:text-slate-900 transition-all duration-200 hover:bg-slate-50/50 px-2 py-1" href="#">Documents</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Entry
            </Button>
            <button className="text-slate-400 hover:text-primary">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-primary">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              DV
            </div>
          </div>
        </div>
      </nav>

      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 border-r border-slate-200/50 pt-20">
        <div className="mb-8 px-2">
          <h2 className="font-bold text-blue-900 text-lg">LexFlow ERP</h2>
          <p className="text-xs text-slate-500">The Digital Jurist</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 p-3 bg-white text-blue-700 shadow-sm rounded-lg font-medium text-sm" href="#">
            <FolderOpen className="w-5 h-5" /> Matter Files
          </a>
          <a className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-150 font-medium text-sm" href="#">
            <Clock className="w-5 h-5" /> Time Tracking
          </a>
          <a className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-150 font-medium text-sm" href="#">
            <DollarSign className="w-5 h-5" /> Financials
          </a>
          <a className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-150 font-medium text-sm" href="#">
            <Calendar className="w-5 h-5" /> Calendar
          </a>
          <a className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-150 font-medium text-sm" href="#">
            <Users className="w-5 h-5" /> Team
          </a>
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-slate-200/50">
          <Button className="w-full gap-2 mb-4">
            <Upload className="w-4 h-4" /> Quick Upload
          </Button>
          <a className="flex items-center gap-3 p-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm" href="#">
            <Settings className="w-5 h-5" /> Settings
          </a>
          <a className="flex items-center gap-3 p-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm" href="#">
            <HelpCircle className="w-5 h-5" /> Support
          </a>
        </div>
      </aside>

      <main className="pl-64 pt-[64px] min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-8">
          <header className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold tracking-widest text-primary uppercase">Case File</span>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                {caseData.caseNumber}: {caseData.title}
              </h1>
              <p className="text-gray-500 mt-1">{caseData.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Archive Case</Button>
              <Button className="gap-2">
                <Edit className="w-4 h-4" /> Edit Details
              </Button>
            </div>
          </header>

          <div className="flex gap-8 mb-8 border-b border-transparent">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Documents</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-all"
                      >
                        <div className={`p-3 rounded-lg ${
                          doc.type === 'contract' ? 'bg-blue-100 text-blue-600' :
                          doc.type === 'evidence' ? 'bg-red-100 text-red-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-semibold text-gray-900 truncate">{doc.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Owner: {doc.owner}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              {doc.date}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              doc.visibility === 'public'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {doc.visibility === 'public' ? 'Public' : 'Confidential'}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-primary">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Legal Requirements Checklist</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary">{progress}% Complete</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${
                          item.completed
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300'
                        }`}>
                          {item.completed && <Check className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </p>
                          {item.completed ? (
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                              Completed {item.completedDate} by {item.completedBy}
                            </p>
                          ) : (
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                              Due in {item.dueIn}
                            </p>
                          )}
                        </div>
                        {!item.completed && item.assignee && (
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                            {item.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <StickyNote className="w-4 h-4 text-primary" /> Internal Memo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      Judge Martinez is known for being strict on discovery deadlines. Ensure all Thorne Corp documents are verified before the Friday hearing.
                    </p>
                    <span className="text-[10px] font-bold text-blue-600">Pinned by Senior Partner</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upcoming Hearing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-blue-50 p-2 rounded-lg min-w-[60px]">
                        <p className="text-[10px] font-bold text-primary uppercase">Oct</p>
                        <p className="text-xl font-extrabold text-primary leading-none">24</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Motion for Summary Judgment</p>
                        <p className="text-xs text-gray-400">09:00 AM - Courtroom 4B</p>
                      </div>
                    </div>
                    <button className="mt-4 text-xs font-bold text-primary uppercase tracking-widest">
                      Add to Calendar
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <Card className="overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Case Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Court</label>
                    <p className="text-sm font-semibold">{caseData.court}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Presiding Judge</label>
                    <div className="flex items-center gap-3">
                      <Building2 className="text-gray-400 w-5 h-5" />
                      <p className="text-sm font-semibold">{caseData.judge}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Primary Client</label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-primary text-xs">
                        {caseData.client.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{caseData.client.name}</p>
                        <p className="text-[10px] text-gray-400">{caseData.client.type}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Billing</label>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{caseData.billing}</p>
                      <span className="text-[10px] text-emerald-600 font-bold">{caseData.billingChange} vs last mo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Venue Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-40 bg-slate-200 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-blue-300" />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded shadow-sm">
                      <p className="text-[10px] font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {caseData.court}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Legal Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{member.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4 text-xs font-bold uppercase">
                    Manage Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <button className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <span className="pr-2 font-semibold text-sm">Case Note</span>
      </button>
    </div>
  )
}
