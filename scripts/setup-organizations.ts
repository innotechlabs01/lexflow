import { createClient } from '@libsql/client'

async function setupOrganizations() {
  const client = createClient({
    url: 'libsql://legal-flox-innotechlabssas.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYyNTk1NTgsImlkIjoiMDE5ZDhlZDktNjcwMS03ZTA2LTgzNmItNTZlNzU1M2ZlYmVhIiwicmlkIjoiY2I3ZTIwZWItZGM1Ni00NzJjLTkyNmYtYzk2NTBiZTNlYzY4In0.tFJC_GbOu6_qBTgNxo2QrT5guCE_dl6YrowOeuoW-iWTcRU1tNpJhUKtFwXHAYSKlW7eRO4DLm6uhETQE4AIDg',
  })

  console.log('🔄 Configurando organizaciones...\n')

  // Crear organizaciones
  const orgs = [
    { name: 'Bufete Legal Test', slug: 'bufete-legal-test', plan: 'pro' },
    { name: 'García & Asociados', slug: 'garcia-asociados', plan: 'enterprise' },
    { name: 'Consultoría Jurídica SA', slug: 'consultoria-juridica', plan: 'pro' },
  ]

  const orgIds: Record<string, string> = {}

  for (const org of orgs) {
    const orgId = crypto.randomUUID()
    orgIds[org.slug] = orgId

    await client.execute({
      sql: `INSERT OR REPLACE INTO organizations 
            (id, name, slug, plan, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [orgId, org.name, org.slug, org.plan, 'active', Date.now(), Date.now()]
    })

    // Crear membresía
    const membershipId = crypto.randomUUID()
    await client.execute({
      sql: `INSERT OR REPLACE INTO memberships 
            (id, organization_id, plan, status, max_lawyers, max_clients, max_cases, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [membershipId, orgId, org.plan, 'active', 10, 100, 200, Date.now()]
    })

    console.log(`✅ Organización: ${org.name} (${org.slug})`)
  }

  console.log('\n📋 Asociando usuarios a organizaciones...\n')

  // Asociar usuarios existentes a la organización principal
  const users = [
    { clerkId: 'user_3CPh1iOr683Rizya7y3sNhkwskr', email: 'superadmin@lexflow.app', role: 'super_admin', name: 'Super Admin', orgSlug: 'bufete-legal-test' },
    { clerkId: 'user_3CPh29oyvLBg3GvKYTfIOymr6Dv', email: 'admin@lexflow.app', role: 'admin', name: 'Admin User', orgSlug: 'bufete-legal-test' },
    { clerkId: 'user_3CPh2Q56Sxcxlc1ZUGM8KMQ9Hmw', email: 'abogado@lexflow.app', role: 'lawyer', name: 'Juan Perez', orgSlug: 'bufete-legal-test' },
    { clerkId: 'user_3CPh2Wnh9p9fKpaxrG7SKQaFgdS', email: 'cliente@lexflow.app', role: 'client', name: 'Maria Garcia', orgSlug: 'bufete-legal-test' },
  ]

  for (const user of users) {
    const userId = crypto.randomUUID()
    const orgId = orgIds[user.orgSlug]

    // Verificar si el usuario ya existe
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE clerk_id = ?',
      args: [user.clerkId]
    })

    if (existing.rows.length > 0) {
      // Actualizar usuario existente
      await client.execute({
        sql: `UPDATE users SET 
              organization_id = ?, role = ?, name = ?, email = ?, 
              updated_at = ? 
              WHERE clerk_id = ?`,
        args: [orgId, user.role, user.name, user.email, Date.now(), user.clerkId]
      })
      console.log(`✅ Usuario actualizado: ${user.email} → ${user.role} en "${user.orgSlug}"`)
    } else {
      // Crear nuevo usuario
      await client.execute({
        sql: `INSERT INTO users 
              (id, clerk_id, organization_id, role, name, email, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [userId, user.clerkId, orgId, user.role, user.name, user.email, 'active', Date.now(), Date.now()]
      })
      console.log(`✅ Usuario creado: ${user.email} → ${user.role} en "${user.orgSlug}"`)
    }

    // Si es cliente, crear registro en clients
    if (user.role === 'client') {
      const existingClient = await client.execute({
        sql: 'SELECT id FROM clients WHERE user_id = (SELECT id FROM users WHERE clerk_id = ?)',
        args: [user.clerkId]
      })

      if (existingClient.rows.length === 0) {
        const clientId = crypto.randomUUID()
        await client.execute({
          sql: `INSERT OR IGNORE INTO clients 
                (id, organization_id, user_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?)`,
          args: [clientId, orgId, userId, Date.now(), Date.now()]
        })
        console.log(`   📋 Cliente DB creado: ${clientId}`)
      }
    }
  }

  // Mostrar resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN')
  console.log('='.repeat(60))
  console.log('\n🏢 ORGANIZACIONES:')
  orgs.forEach(org => console.log(`   • ${org.name} (${org.slug})`))
  
  console.log('\n👥 USUARIOS:')
  console.log('   Super Admin: superadmin@lexflow.app / Lexflow123!')
  console.log('   Admin:       admin@lexflow.app / Lexflow123!')
  console.log('   Abogado:     abogado@lexflow.app / Lexflow123!')
  console.log('   Cliente:     cliente@lexflow.app / Lexflow123!')

  console.log('\n🔑 LINKS DE ACCESO DIRECTO (sin contraseña):')
  console.log('   Super Admin: https://sign-in.accounts.dev/sign-in-token/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg4ODYxMjEsImlpZCI6Imluc18zQ09ibzJTV0tjRWI1T01mSHE2dHZwZFpDb2MiLCJzaWQiOiJzaXRfM0NQalZPQ1A4WHg3SzZOM2Fld1hYN1pVUVRGIiwic3QiOiJzaWduX2luX3Rva2VuIn0.ExwyhNbH4MAcHB0NFXECM0SfDBVMr0-QcY6mzfeBSUZ-bJIdResQVS3FR7r5y4-3EGm26VAmb1KitP-c1JVQQ9PnLuHFk14ryK1X_5yEVCD1g_lSZGX9xs-PKBDO4v7-rEx1nvwkGZBWgVTT2LmVzvbvzGEx0GJyXTZ7Mkx38oLzpjw_nFzxAs0mWdenosJMhjkbP7G4kfdC336_Umw7cq31MCY_QgglefVFG5DV2_VaqLKVUs9JiiXm7SPuflcvrimYuXgCVwyszZLpdx2QwqhZUPaz_ppeetvlWB7W2oBxcuJFZmcO3L6uCuL9E96tHRmduWJK4s0luI9tMGid7Q')
  console.log('   Admin:       https://sign-in.accounts.dev/sign-in-token/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg4ODYxMjEsImlpZCI6Imluc18zQ09ibzJTV0tjRWI1T01mSHE2dHZwZFpDb2MiLCJzaWQiOiJzaXRfM0NQalZLMThMbkw4ak1RQ1hxQ0JHM2JtSGhJIiwic3QiOiJzaWduX2luX3Rva2VuIn0.TmgKt_wTNuXD5D3KfNR2qlUuWZVhps8Hpcx2nclV07tLr3JN5d9picoKvORAC3KokTmAgMJqarvhlUI5X_FTFIYnwbTV1rTNBTLRq5OsxZhVkfrg84CbdzCNGS8bGZJE7HaxBeXehBurXUbAgUVdhf2ug-xOFf3HoMnQoq71N4iQnjmc7wNQfIPyS_s-gmSS-pelVbXn0iZFK-JAKUJIDrMKPSLU1FwH4dupquAErggG9C4ysVOAuybwkw8MK7Hxor0c2gbAgotvwsqtqJkjhVXxq47pI1mEWHee7Twk-x_O_n_NkQt89alQkrw-vVVBOvtnsUcYgyIxtDIzf7ir4g')
  
  console.log('\n⚠️  NOTA: Los tokens expiran en 30 días. Regenera si es necesario.')
  console.log('='.repeat(60))

  await client.close()
}

setupOrganizations().catch(console.error)
