'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarCreateHearingForm } from './calendar-create-hearing-form'
import { HearingDetailsModal } from './hearing-details-modal'

const eventTypeColors: Record<string, string> = {
  initial: 'bg-primary-500',
  preliminary: 'bg-primary-400',
  instruction: 'bg-warning-500',
  trial: 'bg-danger-500',
  appeal: 'bg-purple-500',
  revision: 'bg-cyan-500',
  follow_up: 'bg-success-500',
  conciliation: 'bg-orange-500',
  other: 'bg-gray-400',
}

const eventTypeLabels: Record<string, string> = {
  initial: 'Audiencia Inicial',
  preliminary: 'Audiencia Preliminar',
  instruction: 'Instrucción',
  trial: 'Juicio',
  appeal: 'Apelación',
  revision: 'Revisión',
  follow_up: 'Seguimiento',
  conciliation: 'Conciliación',
  other: 'Otro',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  postponed: 'Pospuesta',
  cancelled: 'Cancelada',
  completed: 'Completada',
  rescheduled: 'Reprogramada',
}

interface CalendarDay {
  day: number
  currentMonth: boolean
  hearingsCount: number
}

interface Hearing {
  id: string
  title: string
  caseName: string
  date: string
  time: string
  duration: number
  court: string
  location: string
  type: string
  status: string
  virtualLink?: string
}

interface CalendarPageClientProps {
  initialHearings: Hearing[]
  initialYear: number
  initialMonth: number
  cases?: Array<{ id: string; title: string }>
}

export default function CalendarPageClient({
  initialHearings,
  initialYear,
  initialMonth,
  cases = [],
}: CalendarPageClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth - 1, 1))
  const [hearings, setHearings] = useState<Hearing[]>(initialHearings)
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const monthName = currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const calendarDays: CalendarDay[] = []

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      hearingsCount: 0,
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const count = hearings.filter((h) => h.date === dateStr).length
    calendarDays.push({ day: i, currentMonth: true, hearingsCount: count })
  }

  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, currentMonth: false, hearingsCount: 0 })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getHearingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return hearings.filter((h) => h.date === dateStr)
  }

  const openHearingDetails = (hearing: Hearing) => {
    setSelectedHearing(hearing)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-500">Gestiona tus audiencias y eventos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Audiencia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Programar Audiencia</DialogTitle>
              <DialogDescription>
                Agenda una nueva audiencia para un caso existente
              </DialogDescription>
            </DialogHeader>
            <CalendarCreateHearingForm cases={cases} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="capitalize">{monthName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>Hoy</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayHearings = day.currentMonth ? getHearingsForDate(day.day) : []
                  const isToday =
                    day.currentMonth &&
                    day.day === new Date().getDate() &&
                    month === new Date().getMonth() + 1 &&
                    year === new Date().getFullYear()

                  return (
                    <div
                      key={index}
                      className={`aspect-square p-2 rounded-lg text-center ${
                        !day.currentMonth
                          ? 'text-gray-300'
                          : day.hearingsCount > 0
                          ? 'bg-primary-50 border border-primary-200 hover:bg-primary-100'
                          : isToday
                          ? 'bg-primary-100 border border-primary-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          day.hearingsCount > 0 ? 'font-semibold text-primary-700' : ''
                        }`}
                      >
                        {day.day}
                      </span>
                      {day.hearingsCount > 0 && (
                        <div className="mt-1 flex justify-center gap-0.5">
                          {Array.from({ length: Math.min(day.hearingsCount, 3) }).map((_, i) => (
                            <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Audiencias del Mes</h2>
          {hearings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No hay audiencias programadas para este mes
              </CardContent>
            </Card>
          ) : (
            hearings.map((hearing) => (
              <Dialog key={hearing.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-3 w-3 rounded-full mt-1.5 ${
                            eventTypeColors[hearing.type] || 'bg-gray-400'
                          }`}
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {eventTypeLabels[hearing.type] || hearing.type}
                            </p>
                            <p className="text-sm text-gray-500">{hearing.caseName}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {hearing.time} ({hearing.duration} min)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {hearing.court}
                              {hearing.location && ` - ${hearing.location}`}
                            </span>
                          </div>
                          {hearing.virtualLink && (
                            <div className="flex items-center gap-1 text-sm text-primary-600">
                              <Video className="h-3 w-3" />
                              <span>Enlace virtual</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary">{hearing.date}</Badge>
                            <Badge variant="outline">{statusLabels[hearing.status] || hearing.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Detalle de Audiencia</DialogTitle>
                  </DialogHeader>
                  <HearingDetailsModal hearing={hearing} />
                </DialogContent>
              </Dialog>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedHearing} onOpenChange={() => setSelectedHearing(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle de Audiencia</DialogTitle>
          </DialogHeader>
          {selectedHearing && <HearingDetailsModal hearing={selectedHearing} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}