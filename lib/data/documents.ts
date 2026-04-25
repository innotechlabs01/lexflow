import { db } from '@/lib/db'
import { documents, cases, users } from '@/lib/db/schema'
import { eq, and, desc, sql, like } from 'drizzle-orm'
import type { AuthContext } from '@/lib/auth/middleware'
import type { DocumentCategory } from '@/types/auth'

export interface DocumentWithRelations {
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
  expiresAt: Date | null
  downloadCount: number
  lastDownloadedAt: Date | null
  createdAt: Date
  updatedAt: Date
  case?: {
    id: string
    title: string
    caseNumber: string | null
  } | null
  uploader?: {
    name: string
    email: string
  } | null
}

export interface DocumentsFilters {
  caseId?: string
  clientId?: string
  documentType?: DocumentCategory
  search?: string
  isConfidential?: boolean
}

export interface DocumentsQueryOptions {
  filters?: DocumentsFilters
  limit?: number
  offset?: number
}

export interface DocumentsResult {
  documents: DocumentWithRelations[]
  total: number
  totalSize: number
  byType: Record<string, number>
}

export async function getDocuments(
  ctx: AuthContext,
  options: DocumentsQueryOptions = {}
): Promise<DocumentsResult> {
  const { filters = {}, limit = 50, offset = 0 } = options

  const conditions = []

  if (filters.caseId) {
    conditions.push(eq(documents.caseId, filters.caseId))
  }

  if (filters.clientId) {
    conditions.push(eq(documents.clientId, filters.clientId))
  }

  if (filters.documentType) {
    conditions.push(eq(documents.documentType, filters.documentType))
  }

  if (filters.search) {
    conditions.push(like(documents.name, `%${filters.search}%`))
  }

  if (filters.isConfidential !== undefined) {
    conditions.push(eq(documents.isConfidential, filters.isConfidential))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const results = await db
    .select({
      id: documents.id,
      caseId: documents.caseId,
      uploadedBy: documents.uploadedBy,
      clientId: documents.clientId,
      name: documents.name,
      originalName: documents.originalName,
      filePath: documents.filePath,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      documentType: documents.documentType,
      tags: documents.tags,
      description: documents.description,
      isConfidential: documents.isConfidential,
      expiresAt: documents.expiresAt,
      downloadCount: documents.downloadCount,
      lastDownloadedAt: documents.lastDownloadedAt,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      caseIdRel: cases.id,
      caseTitle: cases.title,
      caseNumber: cases.caseNumber,
      uploaderName: users.name,
      uploaderEmail: users.email,
    })
    .from(documents)
    .leftJoin(cases, eq(documents.caseId, cases.id))
    .leftJoin(users, eq(documents.uploadedBy, users.id))
    .where(whereClause)
    .orderBy(desc(documents.createdAt))
    .limit(limit)
    .offset(offset)

  // Map results to DocumentWithRelations format
  const mappedResults = results.map((row: any) => ({
    id: row.id,
    caseId: row.caseId,
    uploadedBy: row.uploadedBy,
    clientId: row.clientId,
    name: row.name,
    originalName: row.originalName,
    filePath: row.filePath,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    documentType: row.documentType,
    tags: row.tags,
    description: row.description,
    isConfidential: row.isConfidential,
    expiresAt: row.expiresAt,
    downloadCount: row.downloadCount,
    lastDownloadedAt: row.lastDownloadedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    case: row.caseIdRel ? {
      id: row.caseIdRel,
      title: row.caseTitle,
      caseNumber: row.caseNumber,
    } : null,
    uploader: row.uploaderName ? {
      name: row.uploaderName,
      email: row.uploaderEmail,
    } : null,
  }))

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(whereClause)

  const sizeResult = await db
    .select({ total: sql<number>`coalesce(sum(file_size), 0)` })
    .from(documents)
    .where(whereClause)

  const typeCounts = await db
    .select({
      type: documents.documentType,
      count: sql<number>`count(*)`,
    })
    .from(documents)
    .where(whereClause)
    .groupBy(documents.documentType)

  const total = Number(countResult[0]?.count) || 0
  const totalSize = Number(sizeResult[0]?.total) || 0

  return {
    documents: mappedResults,
    total,
    totalSize,
    byType: Object.fromEntries(typeCounts.map((t: any) => [t.type || 'other', Number(t.count)])),
  }
}

export async function getDocumentById(
  ctx: AuthContext,
  documentId: string
): Promise<DocumentWithRelations | null> {
  const result = await db
    .select({
      id: documents.id,
      caseId: documents.caseId,
      uploadedBy: documents.uploadedBy,
      clientId: documents.clientId,
      name: documents.name,
      originalName: documents.originalName,
      filePath: documents.filePath,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      documentType: documents.documentType,
      tags: documents.tags,
      description: documents.description,
      isConfidential: documents.isConfidential,
      expiresAt: documents.expiresAt,
      downloadCount: documents.downloadCount,
      lastDownloadedAt: documents.lastDownloadedAt,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      caseIdRel: cases.id,
      caseTitle: cases.title,
      caseNumber: cases.caseNumber,
      uploaderName: users.name,
      uploaderEmail: users.email,
    })
    .from(documents)
    .leftJoin(cases, eq(documents.caseId, cases.id))
    .leftJoin(users, eq(documents.uploadedBy, users.id))
    .where(eq(documents.id, documentId))
    .limit(1)

  if (!result[0]) return null

  const row = result[0]
  return {
    id: row.id,
    caseId: row.caseId,
    uploadedBy: row.uploadedBy,
    clientId: row.clientId,
    name: row.name,
    originalName: row.originalName,
    filePath: row.filePath,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    documentType: row.documentType,
    tags: row.tags,
    description: row.description,
    isConfidential: row.isConfidential,
    expiresAt: row.expiresAt,
    downloadCount: row.downloadCount,
    lastDownloadedAt: row.lastDownloadedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    case: row.caseIdRel ? {
      id: row.caseIdRel,
      title: row.caseTitle,
      caseNumber: row.caseNumber,
    } : null,
    uploader: row.uploaderName ? {
      name: row.uploaderName,
      email: row.uploaderEmail,
    } : null,
  }
}

export async function createDocument(
  ctx: AuthContext,
  data: {
    name: string
    filePath: string
    caseId?: string
    documentType?: DocumentCategory
    fileSize?: number
    mimeType?: string
    description?: string
    isConfidential?: boolean
  }
) {
  if (!ctx.organizationId) {
    throw new Error('User must belong to an organization to create a document');
  }

  const result = await db
    .insert(documents)
    .values({
      name: data.name,
      originalName: data.name,
      filePath: data.filePath,
      caseId: data.caseId,
      organizationId: ctx.organizationId,
      uploadedBy: ctx.userId,
      documentType: data.documentType,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      description: data.description,
      isConfidential: data.isConfidential || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

   return result[0]
}

export async function incrementDownloadCount(documentId: string) {
  await db
    .update(documents)
    .set({
      downloadCount: sql`${documents.downloadCount} + 1`,
      lastDownloadedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
