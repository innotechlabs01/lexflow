import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Create TursoDB client only if credentials exist
let _client: ReturnType<typeof createClient> | null = null

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  
  if (!url) {
    console.warn('TURSO_DATABASE_URL not configured, using local file database')
    return createClient({
      url: 'file:local.db',
    })
  }
  
  return createClient({
    url,
    authToken: token,
  })
}

// Initialize client lazily
if (typeof window === 'undefined') {
  _client = createDbClient()
}

// Create Drizzle instance
export const db = _client ? drizzle(_client, { schema }) : {} as any

// Export schema for convenience
export * from './schema'

// Export types
export type Database = typeof db