import { z } from 'zod'

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// ============================================
// Organization Schemas
// ============================================

export const organizationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
})

// ============================================
// Client Schemas
// ============================================

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  documentType: z.enum(['CC', 'CE', 'NIT', 'PASSPORT', 'OTHER']).optional(),
  documentNumber: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  referredBy: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  assignedLawyerId: z.string().optional(),
})

// ============================================
// Case Schemas
// ============================================

export const caseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  caseNumber: z.string().optional().or(z.literal('')),
  internalCode: z.string().optional().or(z.literal('')),
  court: z.string().optional().or(z.literal('')),
  judge: z.string().optional().or(z.literal('')),
  caseType: z.enum(['labor', 'civil', 'criminal', 'family', 'administrative', 'constitutional', 'commercial', 'property', 'tax', 'other']).optional(),
  caseSubtype: z.string().optional().or(z.literal('')),
  status: z.enum(['open', 'in_progress', 'hearing', 'appeal', 'closed', 'archived']).default('open'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  amountInDispute: z.number().optional(),
  currency: z.string().default('COP'),
  description: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
  radicado: z.string().optional().or(z.literal('')),
  clientId: z.string().optional(),
  lawyerId: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

// ============================================
// Task Schemas
// ============================================

export const taskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional().or(z.literal('')),
  caseId: z.string().optional(),
  assignedTo: z.string().optional(),
  taskType: z.enum(['research', 'document', 'court_filing', 'client_meeting', 'hearing_prep', 'deadline', 'follow_up', 'internal', 'other']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'blocked']).default('pending'),
  dueDate: z.number().optional(),
  timeEstimatedMinutes: z.number().optional(),
  notes: z.string().optional().or(z.literal('')),
})

// ============================================
// Hearing Schemas
// ============================================

export const hearingSchema = z.object({
  caseId: z.string(),
  hearingType: z.enum(['initial', 'preliminary', 'instruction', 'trial', 'appeal', 'revision', 'follow_up', 'conciliation', 'other']).optional(),
  court: z.string().optional().or(z.literal('')),
  courtroom: z.string().optional().or(z.literal('')),
  judgeName: z.string().optional().or(z.literal('')),
  hearingDate: z.number(),
  durationMinutes: z.number().default(60),
  location: z.string().optional().or(z.literal('')),
  virtualLink: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
})

// ============================================
// Document Schemas
// ============================================

export const documentUploadSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  documentType: z.enum(['contract', 'petition', 'evidence', 'motion', 'ruling', 'correspondence', 'power_of_attorney', 'id_document', 'proof_of_address', 'financial_statement', 'other']).optional(),
  description: z.string().optional().or(z.literal('')),
  isConfidential: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

// ============================================
// Event Schema (Timeline)
// ============================================

export const eventSchema = z.object({
  caseId: z.string(),
  eventType: z.enum(['procedural', 'document', 'hearing', 'communication', 'internal_note', 'status_change', 'task', 'notification', 'external_sync']),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional().or(z.literal('')),
  eventDate: z.number(),
  visibility: z.enum(['internal', 'client_visible', 'public']).default('internal'),
  eventCategory: z.string().optional().or(z.literal('')),
})

// ============================================
// Notification Schema
// ============================================

export const notificationSchema = z.object({
  userId: z.string(),
  type: z.enum(['case_update', 'hearing_reminder', 'task_assigned', 'document_shared', 'status_change', 'message_received', 'system', 'payment']),
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  channel: z.enum(['in_app', 'email', 'whatsapp', 'sms']).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

// ============================================
// Type exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type OrganizationInput = z.infer<typeof organizationSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type CaseInput = z.input<typeof caseSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type HearingInput = z.infer<typeof hearingSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type EventInput = z.infer<typeof eventSchema>
export type NotificationInput = z.infer<typeof notificationSchema>