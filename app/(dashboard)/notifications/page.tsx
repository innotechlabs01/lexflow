import { Bell, Check, Trash2, Filter, CheckCircle, AlertTriangle, FileText, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthContext } from '@/lib/auth/middleware'
import { getNotifications } from '@/lib/data/notifications'
import { redirect } from 'next/navigation'
import { markAllNotificationsAsRead } from '@/lib/data/notifications'

const notificationTypeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  case_update: { icon: FileText, color: 'bg-primary-100 text-primary-600' },
  hearing_reminder: { icon: Calendar, color: 'bg-warning-100 text-warning-600' },
  task_assigned: { icon: CheckCircle, color: 'bg-success-100 text-success-600' },
  document_shared: { icon: FileText, color: 'bg-cyan-100 text-cyan-600' },
  status_change: { icon: AlertTriangle, color: 'bg-purple-100 text-purple-600' },
  message_received: { icon: MessageSquare, color: 'bg-gray-100 text-gray-600' },
  system: { icon: Bell, color: 'bg-gray-100 text-gray-600' },
  payment: { icon: AlertTriangle, color: 'bg-warning-100 text-warning-600' },
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function NotificationsPage() {
  const ctx = await getAuthContext()

  if (!ctx) {
    redirect('/sign-in')
  }

  const { notifications: notificationsList, total, unreadCount } = await getNotifications(ctx, { limit: 50 })

  const unreadNotifications = notificationsList.filter((n) => n.status === 'unread')
  const readNotifications = notificationsList.filter((n) => n.status === 'read')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-500">Mantente al día con tus actividades</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <form action={async () => {
              'use server'
              const ctx = await getAuthContext()
              if (ctx) {
                await markAllNotificationsAsRead(ctx)
              }
            }}>
              <Button variant="outline" className="gap-2" type="submit">
                <Check className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            </form>
          )}
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-600">{unreadCount}</p>
                <p className="text-sm text-gray-500">No leídas</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <Bell className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success-600">{total - unreadCount}</p>
                <p className="text-sm text-gray-500">Leídas</p>
              </div>
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {unreadNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-600" />
                Nuevas
                <Badge variant="default">{unreadNotifications.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadNotifications.map((notification) => {
                  const IconComponent = notificationTypeConfig[notification.type]?.icon || Bell
                  const iconColor = notificationTypeConfig[notification.type]?.color || 'bg-gray-100 text-gray-600'

                  return (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-primary-50 border border-primary-100"
                    >
                      <div className={`p-2 rounded-lg ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.data?.caseName as string || ''}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-500">Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            {readNotifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay notificaciones anteriores</p>
            ) : (
              <div className="space-y-4">
                {readNotifications.map((notification) => {
                  const IconComponent = notificationTypeConfig[notification.type]?.icon || Bell
                  const iconColor = notificationTypeConfig[notification.type]?.color || 'bg-gray-100 text-gray-600'

                  return (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100"
                    >
                      <div className={`p-2 rounded-lg ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{notification.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {notification.data?.caseName as string || ''}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
