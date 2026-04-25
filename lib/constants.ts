// ============================================
// App Constants
// ============================================

export const APP_NAME = 'LexFlow'
export const APP_DESCRIPTION = 'Plataforma de Gestión Legal para Bufetes de Abogados'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ============================================
// Pagination
// ============================================

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================
// Plans
// ============================================

export const PLAN_LIMITS = {
  free: {
    lawyers: 1,
    clients: 10,
    cases: 20,
    storageGb: 1,
    automations: 0,
  },
  pro: {
    lawyers: 5,
    clients: 100,
    cases: 500,
    storageGb: 50,
    automations: 10,
  },
  enterprise: {
    lawyers: Infinity,
    clients: Infinity,
    cases: Infinity,
    storageGb: 500,
    automations: 100,
  },
} as const

export const PLAN_PRICES = {
  free: 0,
  pro: 49,
  enterprise: 199,
} as const

// ============================================
// Case Status
// ============================================

export const CASE_STATUS = {
  open: { label: 'Abierto', color: 'blue' },
  in_progress: { label: 'En Progreso', color: 'yellow' },
  hearing: { label: 'En Audiencia', color: 'purple' },
  appeal: { label: 'En Apelación', color: 'orange' },
  closed: { label: 'Cerrado', color: 'green' },
  archived: { label: 'Archivado', color: 'gray' },
} as const

export const CASE_TYPES = {
  labor: 'Laboral',
  civil: 'Civil',
  criminal: 'Penal',
  family: 'Familia',
  administrative: 'Administrativo',
  constitutional: 'Constitucional',
  commercial: 'Comercial',
  property: 'Inmobiliario',
  tax: 'Tributario',
  other: 'Otro',
} as const

export const CASE_PRIORITIES = {
  low: { label: 'Baja', color: 'gray' },
  normal: { label: 'Normal', color: 'blue' },
  high: { label: 'Alta', color: 'orange' },
  urgent: { label: 'Urgente', color: 'red' },
} as const

// ============================================
// Lawyer Specialties
// ============================================

export const LAWYER_SPECIALTIES = {
  civil: 'Derecho Civil',
  criminal: 'Derecho Penal',
  family: 'Derecho de Familia',
  labor: 'Derecho Laboral',
  administrative: 'Derecho Administrativo',
  constitutional: 'Derecho Constitucional',
  commercial: 'Derecho Comercial',
  property: 'Derecho Comercial',
  tax: 'Derecho Tributario',
  corporate: 'Derecho Corporativo',
  intellectual_property: 'Propiedad Intelectual',
  immigration: 'Derecho Migratorio',
  environmental: 'Derecho Ambiental',
  health: 'Derecho Salud',
  other: 'Otro',
} as const

export const LAWYER_SPECIALTY_LABELS: Record<string, string> = {
  civil: 'Derecho Civil',
  criminal: 'Derecho Penal',
  family: 'Derecho de Familia',
  labor: 'Derecho Laboral',
  administrative: 'Derecho Administrativo',
  constitutional: 'Derecho Constitucional',
  commercial: 'Derecho Comercial',
  property: 'Derecho de Propiedad',
  tax: 'Derecho Tributario',
  corporate: 'Derecho Corporativo',
  intellectual_property: 'Propiedad Intelectual',
  immigration: 'Derecho Migratorio',
  environmental: 'Derecho Ambiental',
  health: 'Derecho Salud',
  other: 'Otro',
}

// ============================================
// Document Types
// ============================================

export const DOCUMENT_TYPES = {
  contract: 'Contrato',
  petition: 'Demanda/Petición',
  evidence: 'Prueba',
  motion: 'Escrito',
  ruling: 'Sentencia',
  correspondence: 'Correspondencia',
  power_of_attorney: 'Poder',
  id_document: 'Documento de Identidad',
  proof_of_address: 'Certificado de Domicilio',
  financial_statement: 'Estado Financiero',
  other: 'Otro',
} as const

// ============================================
// Task Status
// ============================================

export const TASK_STATUS = {
  pending: { label: 'Pendiente', color: 'gray' },
  in_progress: { label: 'En Progreso', color: 'blue' },
  completed: { label: 'Completada', color: 'green' },
  cancelled: { label: 'Cancelada', color: 'red' },
  blocked: { label: 'Bloqueada', color: 'orange' },
} as const

export const TASK_TYPES = {
  research: 'Investigación',
  document: 'Documento',
  court_filing: 'Presentación Judicial',
  client_meeting: 'Reunión con Cliente',
  hearing_prep: 'Preparación Audiencia',
  deadline: 'Fecha Límite',
  follow_up: 'Seguimiento',
  internal: 'Interno',
  other: 'Otro',
} as const

// ============================================
// Hearing Types
// ============================================

export const HEARING_TYPES = {
  initial: 'Inicial',
  preliminary: 'Preparatoria',
  instruction: 'Instrucción',
  trial: 'Juicio',
  appeal: 'Apelación',
  revision: 'Revisión',
  follow_up: 'Seguimiento',
  conciliation: 'Conciliación',
  other: 'Otra',
} as const

export const HEARING_STATUS = {
  scheduled: { label: 'Programada', color: 'blue' },
  postponed: { label: 'Aplazada', color: 'yellow' },
  cancelled: { label: 'Cancelada', color: 'red' },
  completed: { label: 'Completada', color: 'green' },
  rescheduled: { label: 'Reprogramada', color: 'orange' },
} as const

// ============================================
// User Roles
// ============================================

export const USER_ROLES = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  lawyer: 'Abogado',
  client: 'Cliente',
} as const

// ============================================
// Notification Types
// ============================================

export const NOTIFICATION_TYPES = {
  case_update: 'Actualización de Caso',
  hearing_reminder: 'Recordatorio de Audiencia',
  task_assigned: 'Tarea Asignada',
  document_shared: 'Documento Compartido',
  status_change: 'Cambio de Estado',
  message_received: 'Mensaje Recibido',
  system: 'Sistema',
  payment: 'Pago',
} as const

// ============================================
// Event Types (Timeline)
// ============================================

export const EVENT_TYPES = {
  procedural: { label: 'Procesal', color: 'blue' },
  document: { label: 'Documento', color: 'blue' },
  hearing: { label: 'Audiencia', color: 'orange' },
  communication: { label: 'Comunicación', color: 'green' },
  internal_note: { label: 'Nota Interna', color: 'gray' },
  status_change: { label: 'Cambio de Estado', color: 'purple' },
  task: { label: 'Tarea', color: 'pink' },
  notification: { label: 'Notificación', color: 'cyan' },
  external_sync: { label: 'Sincronización Externa', color: 'cyan' },
} as const

// ============================================
// Document Type (Colombia)
// ============================================

export const DOCUMENT_TYPE_LABELS = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  NIT: 'NIT',
  PASSPORT: 'Pasaporte',
  OTHER: 'Otro',
} as const

// ============================================
// Currency
// ============================================

export const CURRENCIES = {
  COP: { symbol: '$', name: 'Peso Colombiano' },
  USD: { symbol: 'US$', name: 'Dólar Estadounidense' },
  EUR: { symbol: '€', name: 'Euro' },
  MXN: { symbol: 'MX$', name: 'Peso Mexicano' },
  ARS: { symbol: 'AR$', name: 'Peso Argentino' },
  CLP: { symbol: 'CLP$', name: 'Peso Chileno' },
} as const

// ============================================
// Navigation
// ============================================

export const SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/cases', label: 'Casos', icon: 'Briefcase' },
  { href: '/clients', label: 'Clientes', icon: 'Users' },
  { href: '/documents', label: 'Documentos', icon: 'FileText' },
  { href: '/calendar', label: 'Calendario', icon: 'Calendar' },
  { href: '/tasks', label: 'Tareas', icon: 'CheckSquare' },
  { href: '/notifications', label: 'Notificaciones', icon: 'Bell' },
] as const

// Lawyer: incluye cases y calendar
export const LAWYER_SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/cases', label: 'Casos', icon: 'Briefcase' },
  //{ href: '/clients', label: 'Clientes', icon: 'Users' },
  //{ href: '/documents', label: 'Documentos', icon: 'FileText' },
  { href: '/calendar', label: 'Calendario', icon: 'Calendar' },
  { href: '/tasks', label: 'Tareas', icon: 'CheckSquare' },
  { href: '/notifications', label: 'Notificaciones', icon: 'Bell' },
] as const

// Admin: excluye cases y calendar
export const ADMIN_SIDEBAR_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/clients', label: 'Clientes', icon: 'Users' },
  //{ href: '/documents', label: 'Documentos', icon: 'FileText' },
  //{ href: '/tasks', label: 'Tareas', icon: 'CheckSquare' },
  { href: '/lawyers', label: 'Abogados', icon: 'UserCog' },
  { href: '/members', label: 'Miembros', icon: 'UserCog' },
  { href: '/notifications', label: 'Notificaciones', icon: 'Bell' },
] as const

export const ADMIN_LINKS = [
  { href: '/settings/organization', label: 'Organización', icon: 'Building' },
  { href: '/settings/members', label: 'Miembros', icon: 'UserCog' },
  { href: '/settings/billing', label: 'Facturación', icon: 'CreditCard' },
] as const

export const SUPER_ADMIN_LINKS = [
  { href: '/super-admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/super-admin/users', label: 'Administradores', icon: 'UserCog' },
  { href: '/super-admin/memberships', label: 'Membresías', icon: 'CreditCard' },
  { href: '/super-admin/organizations', label: 'Organizaciones', icon: 'Building' },
  { href: '/super-admin/audit-logs', label: 'Auditoría', icon: 'FileText' },
  { href: '/super-admin/settings', label: 'Configuración', icon: 'Settings' },
] as const

// ============================================
// Time Constants
// ============================================

export const REMINDER_TIMES = [
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 día antes' },
] as const