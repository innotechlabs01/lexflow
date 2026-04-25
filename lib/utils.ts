import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number | Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatDateTime(date: number | Date | string): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Case status
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    hearing: 'bg-purple-100 text-purple-800',
    appeal: 'bg-orange-100 text-orange-800',
    closed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    // Task status
    pending: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    blocked: 'bg-red-100 text-red-800',
    // Priority
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
    // User status
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    // Notification status
    unread: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-gray-600',
    normal: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  }
  return colors[priority] || 'text-gray-600'
}

export function getCaseTypeLabel(caseType: string): string {
  const labels: Record<string, string> = {
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
  }
  return labels[caseType] || caseType
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    lawyer: 'Abogado',
    client: 'Cliente',
  }
  return labels[role] || role
}

export function getDocumentTypeLabel(docType: string): string {
  const labels: Record<string, string> = {
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
  }
  return labels[docType] || docType
}