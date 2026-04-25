// ============================================
// Auth Types
// ============================================

export type UserRole = 'super_admin' | 'admin' | 'lawyer' | 'client'

export interface AuthContext {
  userId: string
  organizationId: string | null
  role: UserRole
  isSuperAdmin: boolean
}

export interface User {
  id: string
  clerkId: string
  organizationId: string | null
  role: UserRole
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  status: 'active' | 'inactive' | 'pending'
  lastLoginAt: number | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Organization Types
// ============================================

export type PlanType = 'free' | 'pro' | 'enterprise'
export type OrganizationStatus = 'active' | 'suspended' | 'trial'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: PlanType
  status: OrganizationStatus
  logoUrl: string | null
  settings: Record<string, unknown>
  // Business/organizational details
  industry?: string
  employeeCount?: number
  address?: string
  city?: string
  country?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  createdAt: number
  updatedAt: number
}

export interface Membership {
  id: string
  organizationId: string
  plan: PlanType
  status: 'active' | 'expired' | 'cancelled'
  startedAt: number
  expiresAt: number | null
  maxLawyers: number
  maxClients: number
  maxCases: number
  maxStorageGb: number
  features: string[]
  createdAt: number
}

// ============================================
// Client Types
// ============================================

export type DocumentType = 'CC' | 'CE' | 'NIT' | 'PASSPORT' | 'OTHER'

export interface Client {
  id: string
  userId: string | null
  organizationId: string
  documentType: DocumentType | null
  documentNumber: string | null
  address: string | null
  city: string | null
  department: string | null
  occupation: string | null
  referredBy: string | null
  notes: string | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Case Types
// ============================================

export type CaseType =
  | 'labor'
  | 'civil'
  | 'criminal'
  | 'family'
  | 'administrative'
  | 'constitutional'
  | 'commercial'
  | 'property'
  | 'tax'
  | 'other'

export type CaseStatus =
  | 'open'
  | 'in_progress'
  | 'hearing'
  | 'appeal'
  | 'closed'
  | 'archived'

export type CasePriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Case {
  id: string
  organizationId: string
  clientId: string | null
  lawyerId: string | null
  title: string
  caseNumber: string | null
  internalCode: string | null
  court: string | null
  judge: string | null
  caseType: CaseType | null
  caseSubtype: string | null
  status: CaseStatus
  priority: CasePriority
  amountInDispute: number | null
  currency: string
  description: string | null
  observations: string | null
  openedAt: number | null
  expectedClosingDate: number | null
  closedAt: number | null
  closingReason: string | null
  tags: string[]
  radicado: string | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Event Types
// ============================================

export type EventType =
  | 'procedural'
  | 'document'
  | 'hearing'
  | 'communication'
  | 'internal_note'
  | 'status_change'
  | 'task'
  | 'notification'
  | 'external_sync'

export type EventVisibility = 'internal' | 'client_visible' | 'public'

export type EventSource = 'manual' | 'rama_judicial' | 'automation' | 'client'

export interface CaseEvent {
  id: string
  caseId: string
  createdBy: string | null
  eventType: EventType
  eventCategory: string | null
  title: string
  description: string | null
  eventDate: number
  visibility: EventVisibility
  metadata: Record<string, unknown>
  source: EventSource
  isAutomated: boolean
  createdAt: number
}

// ============================================
// Hearing Types
// ============================================

export type HearingType =
  | 'initial'
  | 'preliminary'
  | 'instruction'
  | 'trial'
  | 'appeal'
  | 'revision'
  | 'follow_up'
  | 'conciliation'
  | 'other'

export type HearingStatus = 'scheduled' | 'postponed' | 'cancelled' | 'completed' | 'rescheduled'

export interface Hearing {
  id: string
  caseId: string
  hearingType: HearingType | null
  court: string | null
  courtroom: string | null
  judgeName: string | null
  hearingDate: number
  durationMinutes: number
  location: string | null
  virtualLink: string | null
  status: HearingStatus
  notes: string | null
  observations: string | null
  outcome: string | null
  nextHearingId: string | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Document Types
// ============================================

export type DocumentCategory =
  | 'contract'
  | 'petition'
  | 'evidence'
  | 'motion'
  | 'ruling'
  | 'correspondence'
  | 'power_of_attorney'
  | 'id_document'
  | 'proof_of_address'
  | 'financial_statement'
  | 'other'

export interface Document {
  id: string
  caseId: string | null
  uploadedBy: string | null
  clientId: string | null
  name: string
  originalName: string | null
  filePath: string
  fileSize: number | null
  mimeType: string | null
  documentType: DocumentCategory | null
  tags: string[]
  description: string | null
  isConfidential: boolean
  expiresAt: number | null
  downloadCount: number
  lastDownloadedAt: number | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Task Types
// ============================================

export type TaskType =
  | 'research'
  | 'document'
  | 'court_filing'
  | 'client_meeting'
  | 'hearing_prep'
  | 'deadline'
  | 'follow_up'
  | 'internal'
  | 'other'

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked'

export interface Task {
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
  dueDate: number | null
  completedAt: number | null
  timeEstimatedMinutes: number | null
  timeSpentMinutes: number | null
  reminders: string[]
  notes: string | null
  createdAt: number
  updatedAt: number
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'case_update'
  | 'hearing_reminder'
  | 'task_assigned'
  | 'document_shared'
  | 'status_change'
  | 'message_received'
  | 'system'
  | 'payment'

export type NotificationChannel = 'in_app' | 'email' | 'whatsapp' | 'sms'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Notification {
  id: string
  userId: string
  organizationId: string | null
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown>
  channel: NotificationChannel | null
  status: NotificationStatus
  sentAt: number | null
  readAt: number | null
  createdAt: number
}

// ============================================
// Audit Log Types
// ============================================

export interface AuditLog {
  id: string
  userId: string | null
  organizationId: string | null
  action: string
  entityType: string
  entityId: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: number
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}