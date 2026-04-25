import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'
import type { NotificationType, NotificationStatus } from '@/types/auth'

export interface NotificationWithData {
  id: string
  userId: string
  organizationId: string | null
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown>
  channel: string | null
  status: NotificationStatus
  sentAt: Date | null
  readAt: Date | null
  createdAt: Date
}

export interface NotificationsQueryOptions {
  status?: NotificationStatus
  type?: NotificationType
  limit?: number
  offset?: number
}

export interface NotificationsResult {
  notifications: NotificationWithData[]
  total: number
  unreadCount: number
}

export async function getNotifications(
  ctx: AuthContext,
  options: NotificationsQueryOptions = {}
): Promise<NotificationsResult> {
  const { status, type, limit = 50, offset = 0 } = options

  const conditions = [eq(notifications.userId, ctx.userId)]

  if (status) {
    conditions.push(eq(notifications.status, status))
  }

  if (type) {
    conditions.push(eq(notifications.type, type))
  }

  const results = await db.query.notifications.findMany({
    where: and(...conditions),
    orderBy: desc(notifications.createdAt),
    limit,
    offset,
  })

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(...conditions))

  const unreadResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, ctx.userId),
        eq(notifications.status, 'unread')
      )
    )

  const total = Number(countResult[0]?.count) || 0
  const unreadCount = Number(unreadResult[0]?.count) || 0

  return {
    notifications: results as NotificationWithData[],
    total,
    unreadCount,
  }
}

export async function markNotificationAsRead(
  ctx: AuthContext,
  notificationId: string
) {
  const result = await db
    .update(notifications)
    .set({
      status: 'read',
      readAt: new Date(),
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, ctx.userId)
      )
    )
    .returning()

  return result[0]
}

export async function markAllNotificationsAsRead(ctx: AuthContext) {
  await db
    .update(notifications)
    .set({
      status: 'read',
      readAt: new Date(),
    })
    .where(eq(notifications.userId, ctx.userId))
}

export async function createNotification(
  ctx: AuthContext,
  data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    data?: Record<string, unknown>
    channel?: string
  }
) {
  const result = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      channel: data.channel as 'in_app' | 'email' | 'whatsapp' | 'sms' | undefined,
      status: 'unread',
      createdAt: new Date(),
    })
    .returning()

  return result[0]
}
