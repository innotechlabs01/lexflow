import { createClient } from '@libsql/client'
import type { AuthContext } from '@/lib/auth/middleware'

let _client: any = null
let _initialized = false

function getDbUrl(): string {
  let url = process.env.TURSO_DATABASE_URL
  
  if (url && url.length > 10 && !url.includes('undefined')) {
    return url
  }
  
  url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL
  if (url && url.length > 10 && !url.includes('undefined')) {
    return url
  }
  
  console.warn('[DB] No TURSO_DATABASE_URL found, using local file')
  return 'file:local.db'
}

export function getClient() {
  if (!_client) {
    const url = getDbUrl()
    const token = process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN
    
    try {
      _client = createClient({ url, authToken: token })
      _initialized = true
    } catch (err) {
      console.error('[DB] Failed to create client:', err)
      _client = createClient({ url: 'file:local.db' })
    }
  }
  return _client
}

export function isInitialized(): boolean {
  return _initialized
}