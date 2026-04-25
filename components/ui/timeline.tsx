'use client'

import { FileText, Calendar, MessageSquare, Settings, CheckCircle, AlertCircle, Clock, ExternalLink, User, Building } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineEvent {
  id: string
  type: 'procedural' | 'document' | 'hearing' | 'communication' | 'internal_note' | 'status_change' | 'task' | 'external_sync'
  title: string
  description: string
  date: string
  time?: string
  source?: string
  user?: string
  attachments?: { name: string; url: string }[]
  status?: 'completed' | 'pending' | 'cancelled'
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
  variant?: 'default' | 'compact' | 'horizontal'
  showSource?: boolean
  onEventClick?: (event: TimelineEvent) => void
}

const eventConfig: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  textColor: string
}> = {
  procedural: {
    label: 'Trámite',
    icon: Settings,
    color: 'border-l-primary',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  document: {
    label: 'Documento',
    icon: FileText,
    color: 'border-l-primary',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  hearing: {
    label: 'Audiencia',
    icon: Calendar,
    color: 'border-l-warning',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
  communication: {
    label: 'Comunicación',
    icon: MessageSquare,
    color: 'border-l-success',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  internal_note: {
    label: 'Nota',
    icon: Clock,
    color: 'border-l-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
  },
  status_change: {
    label: 'Estado',
    icon: AlertCircle,
    color: 'border-l-purple-500',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  task: {
    label: 'Tarea',
    icon: CheckCircle,
    color: 'border-l-pink-500',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-600',
  },
  external_sync: {
    label: 'Sincronización',
    icon: ExternalLink,
    color: 'border-l-cyan-500',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-600',
  },
}

const sourceConfig: Record<string, { label: string; color: string }> = {
  manual: { label: 'Manual', color: 'text-gray-500' },
  rama_judicial: { label: 'Rama Judicial', color: 'text-cyan-600' },
  email: { label: 'Email', color: 'text-blue-600' },
  system: { label: 'Sistema', color: 'text-purple-600' },
  client: { label: 'Cliente', color: 'text-emerald-600' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

export function Timeline({
  events,
  className,
  variant = 'default',
  showSource = true,
  onEventClick,
}: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No hay eventos en la timeline</p>
      </div>
    )
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (variant === 'horizontal') {
    return (
      <div className={cn('overflow-x-auto pb-4', className)}>
        <div className="flex gap-4 min-w-max">
          {sortedEvents.map((event, index) => {
            const config = eventConfig[event.type]
            const Icon = config.icon
            const isLast = index === sortedEvents.length - 1

            return (
              <div key={event.id} className="relative">
                <div
                  className={cn(
                    'flex flex-col items-center',
                    !isLast && 'w-32'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      config.bgColor,
                      config.textColor,
                      'border-2 border-white shadow-sm'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isLast && (
                    <div className="absolute top-6 left-full w-32 h-0.5 bg-gray-200" />
                  )}
                  <div className="mt-3 text-center">
                    <p className="text-xs font-semibold text-gray-900">{formatDateShort(event.date)}</p>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[100px] truncate">
                      {event.title}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {sortedEvents.slice(0, 5).map((event) => {
          const config = eventConfig[event.type]
          const Icon = config.icon

          return (
            <div
              key={event.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer',
                onEventClick && 'cursor-pointer'
              )}
              onClick={() => onEventClick?.(event)}
            >
              <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                <Icon className={cn('w-4 h-4', config.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-xs text-gray-500">{formatDateShort(event.date)}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-gray-200 to-gray-100" />
      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const config = eventConfig[event.type]
          const Icon = config.icon
          const isCompleted = event.status === 'completed'
          const isPending = event.status === 'pending'
          const isCancelled = event.status === 'cancelled'

          return (
            <div key={event.id} className="relative flex gap-4">
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  config.bgColor,
                  config.textColor,
                  'border-2 border-white shadow-sm',
                  isCompleted && 'ring-2 ring-emerald-400 ring-offset-2',
                  isCancelled && 'opacity-50'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCancelled ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase',
                          config.bgColor,
                          config.textColor
                        )}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>

                      {event.attachments && event.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {event.attachments.map((attachment) => (
                            <a
                              key={attachment.name}
                              href={attachment.url}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(event.date)}</span>
                          {event.time && <span>• {event.time}</span>}
                        </div>

                        {showSource && event.source && (
                          <div className={cn(
                            'flex items-center gap-1.5 text-xs',
                            sourceConfig[event.source]?.color || 'text-gray-400'
                          )}>
                            <ExternalLink className="w-3 h-3" />
                            <span>{sourceConfig[event.source]?.label || event.source}</span>
                          </div>
                        )}

                        {event.user && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{event.user}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CaseTimeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <div className={className}>
      <Timeline events={events} showSource />
    </div>
  )
}

export function ClientTimeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  const filteredEvents = events.filter(
    (e) => !['internal_note', 'status_change'].includes(e.type)
  )

  return (
    <div className={className}>
      <Timeline events={filteredEvents} variant="horizontal" showSource={false} />
    </div>
  )
}
