import { db } from '@/lib/db'
import { tasks, users, cases } from '@/lib/db/schema'
import { eq, and, desc, sql, isNull } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'
import type { TaskStatus, TaskPriority, TaskType } from '@/types/auth'

export interface TaskWithRelations {
  id: string
  caseId: string | null
  assignedTo: string | null
  lawyerId: string | null
  createdBy: string | null
  title: string
  description: string | null
  taskType: TaskType | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: Date | null
  completedAt: Date | null
  timeEstimatedMinutes: number | null
  timeSpentMinutes: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  case?: {
    id: string
    title: string
    caseNumber: string | null
  } | null
  assignee?: {
    name: string
    email: string
  } | null
}

export interface TasksFilters {
  status?: TaskStatus
  priority?: TaskPriority
  taskType?: TaskType
  caseId?: string
  assignedTo?: string
}

export interface TasksQueryOptions {
  filters?: TasksFilters
  limit?: number
  offset?: number
}

export interface TasksResult {
  tasks: TaskWithRelations[]
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
}

export async function getTasks(
  ctx: AuthContext,
  options: TasksQueryOptions = {}
): Promise<TasksResult> {
  const { filters = {}, limit = 50, offset = 0 } = options

  const conditions = []

  if (!ctx.isSuperAdmin && ctx.organizationId) {
    conditions.push(isNull(tasks.caseId))
  }

  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status))
  }

  if (filters.priority) {
    conditions.push(eq(tasks.priority, filters.priority))
  }

  if (filters.caseId) {
    conditions.push(eq(tasks.caseId, filters.caseId))
  }

  if (filters.assignedTo) {
    conditions.push(eq(tasks.assignedTo, filters.assignedTo))
  }

  if (!ctx.isAdmin && !ctx.isSuperAdmin) {
    conditions.push(eq(tasks.assignedTo, ctx.userId))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const results = await db
    .select({
      id: tasks.id,
      caseId: tasks.caseId,
      assignedTo: tasks.assignedTo,
      lawyerId: tasks.lawyerId,
      createdBy: tasks.createdBy,
      title: tasks.title,
      description: tasks.description,
      taskType: tasks.taskType,
      priority: tasks.priority,
      status: tasks.status,
      dueDate: tasks.dueDate,
      completedAt: tasks.completedAt,
      timeEstimatedMinutes: tasks.timeEstimatedMinutes,
      timeSpentMinutes: tasks.timeSpentMinutes,
      notes: tasks.notes,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      caseIdRel: cases.id,
      caseTitle: cases.title,
      caseNumber: cases.caseNumber,
      assigneeName: users.name,
      assigneeEmail: users.email,
    })
    .from(tasks)
    .leftJoin(cases, eq(tasks.caseId, cases.id))
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(whereClause)
    .orderBy(desc(tasks.dueDate), desc(tasks.createdAt))
    .limit(limit)
    .offset(offset)

  // Map results to TaskWithRelations
  const mappedResults = results.map((row: any) => ({
    id: row.id,
    caseId: row.caseId,
    assignedTo: row.assignedTo,
    lawyerId: row.lawyerId,
    createdBy: row.createdBy,
    title: row.title,
    description: row.description,
    taskType: row.taskType,
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate,
    completedAt: row.completedAt,
    timeEstimatedMinutes: row.timeEstimatedMinutes,
    timeSpentMinutes: row.timeSpentMinutes,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    case: row.caseIdRel ? {
      id: row.caseIdRel,
      title: row.caseTitle,
      caseNumber: row.caseNumber,
    } : null,
    assignee: row.assigneeName ? {
      name: row.assigneeName,
      email: row.assigneeEmail,
    } : null,
  }))

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(whereClause)

  const statusCounts = await db
    .select({
      status: tasks.status,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(whereClause)
    .groupBy(tasks.status)

  const priorityCounts = await db
    .select({
      priority: tasks.priority,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(whereClause)
    .groupBy(tasks.priority)

  const total = Number(countResult[0]?.count) || 0

  return {
    tasks: mappedResults,
    total,
    byStatus: Object.fromEntries(statusCounts.map((s: any) => [s.status, Number(s.count)])),
    byPriority: Object.fromEntries(priorityCounts.map((p: any) => [p.priority, Number(p.count)])),
  }
}

export async function getTaskById(
  ctx: AuthContext,
  taskId: string
): Promise<TaskWithRelations | null> {
  const result = await db
    .select({
      id: tasks.id,
      caseId: tasks.caseId,
      assignedTo: tasks.assignedTo,
      lawyerId: tasks.lawyerId,
      createdBy: tasks.createdBy,
      title: tasks.title,
      description: tasks.description,
      taskType: tasks.taskType,
      priority: tasks.priority,
      status: tasks.status,
      dueDate: tasks.dueDate,
      completedAt: tasks.completedAt,
      timeEstimatedMinutes: tasks.timeEstimatedMinutes,
      timeSpentMinutes: tasks.timeSpentMinutes,
      notes: tasks.notes,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      caseIdRel: cases.id,
      caseTitle: cases.title,
      caseNumber: cases.caseNumber,
      assigneeName: users.name,
      assigneeEmail: users.email,
    })
    .from(tasks)
    .leftJoin(cases, eq(tasks.caseId, cases.id))
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(eq(tasks.id, taskId))
    .limit(1)

  if (!result[0]) return null

  const row = result[0]
  return {
    id: row.id,
    caseId: row.caseId,
    assignedTo: row.assignedTo,
    lawyerId: row.lawyerId,
    createdBy: row.createdBy,
    title: row.title,
    description: row.description,
    taskType: row.taskType,
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate,
    completedAt: row.completedAt,
    timeEstimatedMinutes: row.timeEstimatedMinutes,
    timeSpentMinutes: row.timeSpentMinutes,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    case: row.caseIdRel ? {
      id: row.caseIdRel,
      title: row.caseTitle,
      caseNumber: row.caseNumber,
    } : null,
    assignee: row.assigneeName ? {
      name: row.assigneeName,
      email: row.assigneeEmail,
    } : null,
  }
}

export async function createTask(
  ctx: AuthContext,
  data: {
    title: string
    description?: string
    caseId?: string
    assignedTo?: string
    taskType?: TaskType
    priority?: TaskPriority
    dueDate?: Date
  }
) {
  const result = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.description,
      caseId: data.caseId,
      assignedTo: data.assignedTo || ctx.userId,
      taskType: data.taskType,
      priority: data.priority || 'normal',
      status: 'pending',
      createdBy: ctx.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return result[0]
}

export async function updateTaskStatus(
  ctx: AuthContext,
  taskId: string,
  status: TaskStatus
) {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  }

  if (status === 'completed') {
    updateData.completedAt = new Date()
  }

  const result = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning()

  return result[0]
}
