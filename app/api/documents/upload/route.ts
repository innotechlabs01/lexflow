import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents } from '@/lib/db/schema'
import { getAuthContext } from '@/lib/auth/middleware'
import { uploadToR2, getR2Key } from '@/lib/r2'

function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (ctx.isClient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string | null
    const documentType = formData.get('documentType') as string | null

    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'Archivo y cliente son requeridos' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo no puede exceder 50MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${generateId()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const r2Key = getR2Key(clientId, fileName)

    await uploadToR2(r2Key, buffer, file.type || 'application/pdf')

    const docId = generateId()
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`

    const newDocument = await db
      .insert(documents)
      .values({
        id: docId,
        clientId,
        organizationId: ctx.organizationId,
        uploadedBy: ctx.userId,
        name: file.name,
        originalName: file.name,
        filePath: publicUrl,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        documentType: documentType as any || null,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newDocument[0], { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Error al subir documento' },
      { status: 500 }
    )
  }
}