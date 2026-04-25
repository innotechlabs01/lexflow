import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!
const BUCKET_NAME = 'lexflow'
const PREFIX = 'lexflow-dir'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const fullKey = `${PREFIX}/${key}`
  
  console.log('[R2] Uploading to bucket:', BUCKET_NAME, 'key:', fullKey)

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      Body: buffer,
      ContentType: contentType,
    })
  )

  console.log('[R2] Upload success')
  return fullKey
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const fullKey = `${PREFIX}/${key}`
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fullKey,
  })

  const url = await getSignedUrl(r2, command, { expiresIn })
  return url
}

export async function getFileFromR2(key: string): Promise<{ body: ReadableStream<Uint8Array> | null; contentType: string; contentLength: number }> {
  const fullKey = `${PREFIX}/${key}`

  try {
    const response = await r2.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fullKey,
      })
    )

    return {
      body: response.Body as ReadableStream<Uint8Array>,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || 0,
    }
  } catch (error) {
    console.error('[R2] Get file failed:', error)
    return { body: null, contentType: 'application/octet-stream', contentLength: 0 }
  }
}

export async function deleteFromR2(key: string): Promise<boolean> {
  const fullKey = `${PREFIX}/${key}`

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fullKey,
      })
    )
    return true
  } catch (error) {
    console.error('[R2] Delete failed:', error)
    return false
  }
}

export function getR2Key(clientId: string, fileName: string): string {
  return `clientes/${clientId}/${fileName}`
}