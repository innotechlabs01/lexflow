import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ============================================
// Organizations (Bufetes)
// ============================================

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  status: text('status', { enum: ['active', 'suspended', 'trial'] }).default('active'),
  logoUrl: text('logo_url'),
  settings: text('settings', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  // Additional fields for business/organizational details
  industry: text('industry'),
  employeeCount: integer('employee_count'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  website: text('website'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Memberships
// ============================================

export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).notNull(),
  status: text('status', { enum: ['active', 'expired', 'cancelled'] }).default('active'),
  startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  maxLawyers: integer('max_lawyers').default(1),
  maxClients: integer('max_clients').default(10),
  maxCases: integer('max_cases').default(20),
  maxStorageGb: integer('max_storage_gb').default(1),
  features: text('features', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Users
// ============================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  clerkId: text('clerk_id').notNull().unique(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  role: text('role', { enum: ['super_admin', 'admin', 'lawyer', 'client'] }).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  status: text('status', { enum: ['active', 'inactive', 'pending'] }).default('active'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Lawyers (Perfil profesional)
// ============================================

export const lawyers = sqliteTable('lawyers', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  licenseNumber: text('license_number'),
  specialty: text('specialty'),
  barAssociation: text('bar_association'),
  experienceYears: integer('experience_years'),
  bio: text('bio'),
  signatureUrl: text('signature_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Clients
// ============================================

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  lawyerId: text('lawyer_id').references(() => lawyers.id, { onDelete: 'set null' }),
  documentType: text('document_type', { enum: ['CC', 'CE', 'NIT', 'PASSPORT', 'OTHER'] }),
  documentNumber: text('document_number'),
  address: text('address'),
  city: text('city'),
  department: text('department'),
  occupation: text('occupation'),
  referredBy: text('referred_by'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Cases
// ============================================

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'set null' }),
  lawyerId: text('lawyer_id').references(() => lawyers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  caseNumber: text('case_number').unique(),
  internalCode: text('internal_code'),
  court: text('court'),
  judge: text('judge'),
  caseType: text('case_type', { enum: ['labor', 'civil', 'criminal', 'family', 'administrative', 'constitutional', 'commercial', 'property', 'tax', 'other'] }),
  caseSubtype: text('case_subtype'),
  status: text('status', { enum: ['open', 'in_progress', 'hearing', 'appeal', 'closed', 'archived'] }).default('open'),
  priority: text('priority', { enum: ['low', 'normal', 'high', 'urgent'] }).default('normal'),
  amountInDispute: real('amount_in_dispute'),
  currency: text('currency').default('COP'),
  description: text('description'),
  observations: text('observations'),
  openedAt: integer('opened_at', { mode: 'timestamp' }),
  expectedClosingDate: integer('expected_closing_date', { mode: 'timestamp' }),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  closingReason: text('closing_reason'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  radicado: text('radicado'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Case Events (Timeline)
// ============================================

export const caseEvents = sqliteTable('case_events', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  eventType: text('event_type', { enum: ['procedural', 'document', 'hearing', 'communication', 'internal_note', 'status_change', 'task', 'notification', 'external_sync'] }).notNull(),
  eventCategory: text('event_category'),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: integer('event_date', { mode: 'timestamp' }).notNull(),
  visibility: text('visibility', { enum: ['internal', 'client_visible', 'public'] }).default('internal'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  source: text('source', { enum: ['manual', 'rama_judicial', 'automation', 'client'] }).default('manual'),
  isAutomated: integer('is_automated', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Hearings
// ============================================

export const hearings = sqliteTable('hearings', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  hearingType: text('hearing_type', { enum: ['initial', 'preliminary', 'instruction', 'trial', 'appeal', 'revision', 'follow_up', 'conciliation', 'other'] }),
  court: text('court'),
  courtroom: text('courtroom'),
  judgeName: text('judge_name'),
  hearingDate: integer('hearing_date', { mode: 'timestamp' }).notNull(),
  durationMinutes: integer('duration_minutes').default(60),
  location: text('location'),
  virtualLink: text('virtual_link'),
  status: text('status', { enum: ['scheduled', 'postponed', 'cancelled', 'completed', 'rescheduled'] }).default('scheduled'),
  notes: text('notes'),
  observations: text('observations'),
  outcome: text('outcome'),
  nextHearingId: text('next_hearing_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Documents
// ============================================

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'set null' }),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  originalName: text('original_name'),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  documentType: text('document_type', { enum: ['contract', 'petition', 'evidence', 'motion', 'ruling', 'correspondence', 'power_of_attorney', 'id_document', 'proof_of_address', 'financial_statement', 'other'] }),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  description: text('description'),
  isConfidential: integer('is_confidential', { mode: 'boolean' }).default(false),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  downloadCount: integer('download_count').default(0),
  lastDownloadedAt: integer('last_downloaded_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Tasks
// ============================================

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  lawyerId: text('lawyer_id').references(() => lawyers.id, { onDelete: 'set null' }),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  taskType: text('task_type', { enum: ['research', 'document', 'court_filing', 'client_meeting', 'hearing_prep', 'deadline', 'follow_up', 'internal', 'other'] }),
  priority: text('priority', { enum: ['low', 'normal', 'high', 'urgent'] }).default('normal'),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'cancelled', 'blocked'] }).default('pending'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  timeEstimatedMinutes: integer('time_estimated_minutes'),
  timeSpentMinutes: integer('time_spent_minutes'),
  reminders: text('reminders', { mode: 'json' }).$type<string[]>().default([]),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Notifications
// ============================================

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['case_update', 'hearing_reminder', 'task_assigned', 'document_shared', 'status_change', 'message_received', 'system', 'payment'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  channel: text('channel', { enum: ['in_app', 'email', 'whatsapp', 'sms'] }),
  status: text('status', { enum: ['unread', 'read', 'archived'] }).default('unread'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  readAt: integer('read_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Audit Logs
// ============================================

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  oldValues: text('old_values', { mode: 'json' }).$type<Record<string, unknown>>(),
  newValues: text('new_values', { mode: 'json' }).$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Rama Judicial Sync Log
// ============================================

export const ramaSyncLog = sqliteTable('rama_sync_log', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  caseId: text('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  radicado: text('radicado'),
  idProceso: text('id_proceso'),
  idRamaApi: text('id_rama_api'),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  syncStatus: text('sync_status', { enum: ['success', 'error', 'pending'] }).default('pending'),
  errorMessage: text('error_message'),
  recordsSynced: integer('records_synced').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================
// Relations
// ============================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  users: many(users),
  clients: many(clients),
  cases: many(cases),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  lawyer: one(lawyers),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}))

export const lawyersRelations = relations(lawyers, ({ one, many }) => ({
  user: one(users, {
    fields: [lawyers.userId],
    references: [users.id],
  }),
  cases: many(cases),
  tasks: many(tasks),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  lawyer: one(lawyers, {
    fields: [clients.lawyerId],
    references: [lawyers.id],
  }),
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  cases: many(cases),
  documents: many(documents),
}))

export const casesRelations = relations(cases, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cases.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [cases.clientId],
    references: [clients.id],
  }),
  lawyer: one(lawyers, {
    fields: [cases.lawyerId],
    references: [lawyers.id],
  }),
  events: many(caseEvents),
  hearings: many(hearings),
  documents: many(documents),
  tasks: many(tasks),
  ramaSyncLog: many(ramaSyncLog),
}))

export const caseEventsRelations = relations(caseEvents, ({ one }) => ({
  case: one(cases, {
    fields: [caseEvents.caseId],
    references: [cases.id],
  }),
  createdBy: one(users, {
    fields: [caseEvents.createdBy],
    references: [users.id],
  }),
}))

export const hearingsRelations = relations(hearings, ({ one }) => ({
  case: one(cases, {
    fields: [hearings.caseId],
    references: [cases.id],
  }),
  nextHearing: one(hearings, {
    fields: [hearings.nextHearingId],
    references: [hearings.id],
  }),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  case: one(cases, {
    fields: [tasks.caseId],
    references: [cases.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  lawyer: one(lawyers, {
    fields: [tasks.lawyerId],
    references: [lawyers.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
}))

// ============================================
// Helper Functions
// ============================================

export function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function now(): number {
  return Math.floor(Date.now() / 1000)
}