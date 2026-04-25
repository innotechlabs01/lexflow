import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/middleware'
import { getFileFromR2, deleteFromR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    })

    if (!doc || !doc.filePath) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    const key = doc.filePath.replace(/^https?:\/\/[^/]+\//, '')

    const { body, contentType, contentLength } = await getFileFromR2(key)

    if (!body) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    await db
      .update(documents)
      .set({
        downloadCount: (doc.downloadCount || 0) + 1,
        lastDownloadedAt: new Date(),
      })
      .where(eq(documents.id, id))

    const chunks: Uint8Array[] = []
    if (body) {
      const reader = body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    }
    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${doc.originalName || 'documento'}"`,
        'Content-Length': contentLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Error al descargar documento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext()
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    })

    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    if (doc.filePath) {
      const key = doc.filePath.replace(/^https?:\/\/[^/]+\//, '')
      await deleteFromR2(key)
    }

    await db.delete(documents).where(eq(documents.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}