import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sql } from 'drizzle-orm'

function generateId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const tursoUrl = process.env.TURSO_DATABASE_URL!
const tursoToken = process.env.TURSO_AUTH_TOKEN!

async function seed() {
  console.log('🔄 Conectando a Turso DB...')

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })

  const db = drizzle(client)

  console.log('📦 Creando datos de prueba...\n')

  // Crear organización de prueba
  const orgId = generateId()
  await db.run(sql`
    INSERT OR IGNORE INTO organizations (id, name, slug, plan, status, created_at, updated_at)
    VALUES (
      ${orgId},
      'Bufete de Prueba',
      'bufete-prueba',
      'pro',
      'active',
      ${Date.now()},
      ${Date.now()}
    )
  `)
  console.log(`✅ Organización creada: ${orgId}`)

  // Crear usuarios de prueba
  const users = [
    {
      id: generateId(),
      clerkId: 'test_super_admin_' + generateId().slice(0, 8),
      organizationId: orgId,
      role: 'super_admin',
      name: 'Super Admin',
      email: 'superadmin@test.com',
      status: 'active',
    },
    {
      id: generateId(),
      clerkId: 'test_admin_' + generateId().slice(0, 8),
      organizationId: orgId,
      role: 'admin',
      name: 'Administrador',
      email: 'admin@test.com',
      status: 'active',
    },
    {
      id: generateId(),
      clerkId: 'test_lawyer_' + generateId().slice(0, 8),
      organizationId: orgId,
      role: 'lawyer',
      name: 'Abogado Test',
      email: 'abogado@test.com',
      status: 'active',
    },
    {
      id: generateId(),
      clerkId: 'test_client_' + generateId().slice(0, 8),
      organizationId: orgId,
      role: 'client',
      name: 'Cliente Test',
      email: 'cliente@test.com',
      status: 'active',
    },
  ]

  for (const user of users) {
    await db.run(sql`
      INSERT OR IGNORE INTO users (
        id, clerk_id, organization_id, role, name, email,
        status, created_at, updated_at
      ) VALUES (
        ${user.id},
        ${user.clerkId},
        ${user.organizationId},
        ${user.role},
        ${user.name},
        ${user.email},
        ${user.status},
        ${Date.now()},
        ${Date.now()}
      )
    `)
    console.log(`✅ Usuario creado: ${user.email} (${user.role})`)
    console.log(`   Clerk ID: ${user.clerkId}`)
    console.log(`   DB ID: ${user.id}\n`)
  }

  // Crear clientes de prueba
  const clientId = generateId()
  const userClientId = users.find(u => u.role === 'client')!.id
  
  await db.run(sql`
    INSERT OR IGNORE INTO clients (
      id, user_id, organization_id, document_type, document_number,
      city, created_at, updated_at
    ) VALUES (
      ${clientId},
      ${userClientId},
      ${orgId},
      'CC',
      '12345678',
      'Bogotá',
      ${Date.now()},
      ${Date.now()}
    )
  `)
  console.log(`✅ Cliente creado: ${clientId}`)

  // Crear un caso de prueba
  const caseId = generateId()
  await db.run(sql`
    INSERT OR IGNORE INTO cases (
      id, organization_id, client_id, title, case_type, status,
      priority, description, created_at, updated_at
    ) VALUES (
      ${caseId},
      ${orgId},
      ${clientId},
      'Caso de Prueba',
      'civil',
      'open',
      'normal',
      'Descripción del caso de prueba',
      ${Date.now()},
      ${Date.now()}
    )
  `)
  console.log(`✅ Caso creado: ${caseId}`)

  console.log('\n' + '='.repeat(50))
  console.log('📋 RESUMEN DE USUARIOS DE PRUEBA')
  console.log('='.repeat(50))
  console.log('\n⚠️  IMPORTANTE: Estos usuarios tienen Clerk IDs de prueba.')
  console.log('   Para probar la app, debes crear usuarios en Clerk Dashboard')
  console.log('   y usar los mismos emails.\n')
  console.log('📧 Emails para probar:')
  users.forEach(u => console.log(`   - ${u.email} (${u.role})`))
  console.log('\n🔗 Ve a: https://dashboard.clerk.com')
  console.log('   > Users > Create user > Usa estos emails\n')

  await client.close()
  console.log('✨ Seed completado!')
}

seed().catch(console.error)
