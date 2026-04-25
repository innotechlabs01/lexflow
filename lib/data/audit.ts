import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { getAuthContext } from '@/lib/auth/middleware'

export type AuditAction = 'create' | 'read' | 'update' | 'delete'

export interface AuditLogInput {
  action: AuditAction
  entityType: string
  entityId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authToken',
  'creditCard',
  'cardNumber',
  'cvv',
]

function sanitizeValues(values: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!values) return undefined
  
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeValues(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export async function logAudit(data: AuditLogInput): Promise<void> {
  try {
    const ctx = await getAuthContext()
    
    if (!ctx) {
      console.warn('Audit log: No auth context, skipping log')
      return
    }

    await db.insert(auditLogs).values({
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      oldValues: data.oldValues ? sanitizeValues(data.oldValues) : null,
      newValues: data.newValues ? sanitizeValues(data.newValues) : null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

export function extractRequestInfo(request: Request | Headers | RequestHeaders): {
  ipAddress?: string
  userAgent?: string
} {
  let ipAddress: string | undefined
  let userAgent: string | undefined

  const headers = request instanceof Request ? request.headers : request

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (!ipAddress && realIp) {
    ipAddress = realIp
  }

  userAgent = headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

interface RequestHeaders {
  get(name: string): string | null
}

export async function logApiAudit(
  request: Request,
  entityType: string,
  entityId: string | undefined,
  action: AuditAction,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestInfo(request.headers)
  
  await logAudit({
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
  })
}

export async function logActionAudit(
  entityType: string,
  entityId: string,
  action: AuditAction,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
  })
}