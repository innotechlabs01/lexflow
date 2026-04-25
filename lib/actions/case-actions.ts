'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { caseEvents, hearings, documents, tasks, cases } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { eventSchema, hearingSchema } from '@/lib/validations'
import { logActionAudit } from '@/lib/data/audit'
import { z } from 'zod'

export async function createCaseEvent(formData: FormData) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    caseId: formData.get('caseId') as string,
    eventType: formData.get('eventType') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || '',
    eventDate: new Date(formData.get('eventDate') as string).getTime(),
    visibility: formData.get('visibility') as string || 'internal',
    eventCategory: formData.get('eventCategory') as string || '',
  }

  const validated = eventSchema.parse(rawData)

  const newEvent = await db.insert(caseEvents).values({
    caseId: validated.caseId,
    eventType: validated.eventType,
    title: validated.title,
    description: validated.description,
    eventDate: new Date(validated.eventDate),
    visibility: validated.visibility,
    eventCategory: validated.eventCategory || null,
    createdBy: ctx.userId,
    organizationId: ctx.organizationId,
  }).returning()

  await logActionAudit('case_event', newEvent[0].id, 'create', undefined, { 
    caseId: validated.caseId, 
    eventType: validated.eventType, 
    title: validated.title 
  })

  revalidatePath(`/cases/${validated.caseId}`)
  return { success: true }
}

export async function createHearing(formData: FormData) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    caseId: formData.get('caseId') as string,
    hearingType: formData.get('hearingType') as string || 'other',
    court: formData.get('court') as string || '',
    courtroom: formData.get('courtroom') as string || '',
    judgeName: formData.get('judgeName') as string || '',
    hearingDate: new Date(formData.get('hearingDate') as string).getTime(),
    durationMinutes: parseInt(formData.get('durationMinutes') as string) || 60,
    location: formData.get('location') as string || '',
    virtualLink: formData.get('virtualLink') as string || '',
    notes: formData.get('notes') as string || '',
    observations: formData.get('observations') as string || '',
  }

  const validated = hearingSchema.parse(rawData)

  const newHearing = await db.insert(hearings).values({
    caseId: validated.caseId,
    hearingType: validated.hearingType || 'other',
    court: validated.court || null,
    courtroom: validated.courtroom || null,
    judgeName: validated.judgeName || null,
    hearingDate: new Date(validated.hearingDate),
    durationMinutes: validated.durationMinutes,
    location: validated.location || null,
    virtualLink: validated.virtualLink || null,
    notes: validated.notes || null,
    observations: validated.observations || null,
    status: 'scheduled',
    organizationId: ctx.organizationId,
  }).returning()

  await logActionAudit('hearing', newHearing[0].id, 'create', undefined, { 
    caseId: validated.caseId, 
    hearingType: validated.hearingType, 
    hearingDate: validated.hearingDate 
  })

  revalidatePath(`/cases/${validated.caseId}`)
  revalidatePath('/calendar')
  return { success: true }
}

export async function uploadDocument(caseId: string, data: {
  name: string
  filePath: string
  fileSize?: number
  mimeType?: string
  documentType?: string
  description?: string
  isConfidential?: boolean
}) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  const newDoc = await db.insert(documents).values({
    name: data.name,
    originalName: data.name,
    filePath: data.filePath,
    caseId: caseId,
    organizationId: ctx.organizationId,
    uploadedBy: ctx.userId,
    documentType: data.documentType as any || null,
    fileSize: data.fileSize || null,
    mimeType: data.mimeType || null,
    description: data.description || null,
    isConfidential: data.isConfidential || false,
  }).returning()

  await logActionAudit('document', newDoc[0].id, 'create', undefined, { 
    name: data.name, 
    caseId: caseId, 
    documentType: data.documentType,
    isConfidential: data.isConfidential 
  })

  revalidatePath(`/cases/${caseId}`)
  return { success: true }
}

export async function createTask(formData: FormData) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  let caseId = formData.get('caseId') as string | null
  let assignedTo = formData.get('assignedTo') as string | null

  if (caseId === '__none__') caseId = null
  if (assignedTo === '__me__') assignedTo = ctx.userId

  const newTask = await db.insert(tasks).values({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    caseId: caseId,
    assignedTo: assignedTo || ctx.userId,
    taskType: (formData.get('taskType') as string) as any || null,
    priority: (formData.get('priority') as string) as any || 'normal',
    status: 'pending',
    dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
    createdBy: ctx.userId,
    organizationId: ctx.organizationId,
  }).returning()

  await logActionAudit('task', newTask[0].id, 'create', undefined, { 
    title: formData.get('title'), 
    caseId: caseId, 
    priority: formData.get('priority'),
    assignedTo: assignedTo 
  })

  if (caseId) {
    revalidatePath(`/cases/${caseId}`)
  }
  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  const existingTask = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  }

  if (status === 'completed') {
    updateData.completedAt = new Date()
  }

  await db.update(tasks).set(updateData).where(eq(tasks.id, taskId))

  await logActionAudit('task', taskId, 'update', { status: existingTask[0]?.status }, { status })

  revalidatePath('/tasks')
  return { success: true }
}

export async function closeCase(caseId: string, closingReason?: string) {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    throw new Error('Unauthorized')
  }

  if (!ctx.isAdmin && !ctx.isLawyer && !ctx.isSuperAdmin) {
    throw new Error('Forbidden')
  }

  const existingCase = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1)

  await db.update(cases).set({
    status: 'closed',
    closedAt: new Date(),
    closingReason: closingReason || null,
    updatedAt: new Date(),
  }).where(eq(cases.id, caseId))

  await db.insert(caseEvents).values({
    caseId: caseId,
    eventType: 'status_change',
    title: 'Caso Cerrado',
    description: closingReason || 'El caso ha sido marcado como cerrado',
    eventDate: new Date(),
    visibility: 'internal',
    createdBy: ctx.userId,
    organizationId: ctx.organizationId,
  })

  await logActionAudit('case', caseId, 'update', { status: existingCase[0]?.status }, { status: 'closed', closingReason })

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/cases')
  return { success: true }
}