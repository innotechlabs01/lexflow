import { createClient } from '@libsql/client'

async function seed() {
  const client = createClient({
    url: 'libsql://legal-flox-innotechlabssas.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYyNTk1NTgsImlkIjoiMDE5ZDhlZDktNjcwMS03ZTA2LTgzNmItNTZlNzU1M2ZlYmVhIiwicmlkIjoiY2I3ZTIwZWItZGM1Ni00NzJjLTkyNmYtYzk2NTBiZTNlYzY4In0.tFJC_GbOu6_qBTgNxo2QrT5guCE_dl6YrowOeuoW-iWTcRU1tNpJhUKtFwXHAYSKlW7eRO4DLm6uhETQE4AIDg',
  })

  console.log('🔄 Conectando a Turso DB...')

  const orgId = crypto.randomUUID()
  await client.execute({
    sql: 'INSERT OR IGNORE INTO organizations (id, name, slug, plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [orgId, 'Bufete Legal Test', 'bufete-legal', 'pro', 'active', Date.now(), Date.now()]
  })
  console.log('✅ Organización creada:', orgId)

  const users = [
    { clerkId: 'user_3CPh1iOr683Rizya7y3sNhkwskr', role: 'super_admin', name: 'Super Admin', email: 'superadmin@lexflow.app' },
    { clerkId: 'user_3CPh29oyvLBg3GvKYTfIOymr6Dv', role: 'admin', name: 'Admin User', email: 'admin@lexflow.app' },
    { clerkId: 'user_3CPh2Q56Sxcxlc1ZUGM8KMQ9Hmw', role: 'lawyer', name: 'Juan Perez', email: 'abogado@lexflow.app' },
    { clerkId: 'user_3CPh2Wnh9p9fKpaxrG7SKQaFgdS', role: 'client', name: 'Maria Garcia', email: 'cliente@lexflow.app' },
  ]

  for (const user of users) {
    const userId = crypto.randomUUID()
    await client.execute({
      sql: 'INSERT OR REPLACE INTO users (id, clerk_id, organization_id, role, name, email, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [userId, user.clerkId, orgId, user.role, user.name, user.email, 'active', Date.now(), Date.now()]
    })
    console.log(`✅ Usuario: ${user.email} (${user.role})`)
    console.log(`   Clerk ID: ${user.clerkId}`)

    if (user.role === 'client') {
      const clientId = crypto.randomUUID()
      await client.execute({
        sql: 'INSERT OR IGNORE INTO clients (id, organization_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        args: [clientId, orgId, userId, Date.now(), Date.now()]
      })
      console.log(`   Client DB ID: ${clientId}`)
    }
  }

  await client.close()
  console.log('\n✨ Seed completado!')
}

seed().catch(console.error)
