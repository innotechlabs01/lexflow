'use client'

import { Clock, MapPin, Video, Building, User, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline'> = {
  scheduled: 'warning',
  postponed: 'secondary',
  cancelled: 'danger',
  completed: 'success',
  rescheduled: 'outline',
}

interface HearingDetails {
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
  judgeName?: string
  courtroom?: string
  notes?: string
  observations?: string
}

export function HearingDetailsModal({ hearing }: { hearing: HearingDetails }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {eventTypeLabels[hearing.type] || hearing.type}
          </h3>
          <p className="text-sm text-gray-500">{hearing.caseName}</p>
        </div>
        <Badge variant={statusVariants[hearing.status] || 'secondary'}>
          {statusLabels[hearing.status] || hearing.status}
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Fecha y Hora</p>
            <p className="text-sm text-gray-600">
              {new Date(hearing.date).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} - {hearing.time}
            </p>
            <p className="text-xs text-gray-500">Duración: {hearing.duration} minutos</p>
          </div>
        </div>

        {hearing.court && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Juzgado</p>
              <p className="text-sm text-gray-600">{hearing.court}</p>
              {hearing.courtroom && (
                <p className="text-xs text-gray-500">Sala: {hearing.courtroom}</p>
              )}
            </div>
          </div>
        )}

        {hearing.judgeName && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Juez</p>
              <p className="text-sm text-gray-600">{hearing.judgeName}</p>
            </div>
          </div>
        )}

        {hearing.location && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Ubicación</p>
              <p className="text-sm text-gray-600">{hearing.location}</p>
            </div>
          </div>
        )}

        {hearing.virtualLink && (
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
            <Video className="h-5 w-5 text-primary-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-700">Enlace Virtual</p>
              <a
                href={hearing.virtualLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                {hearing.virtualLink}
              </a>
            </div>
          </div>
        )}

        {hearing.notes && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Notas</p>
              <p className="text-sm text-gray-600">{hearing.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}