const CLERK_SECRET_KEY = 'sk_test_8Biu2yi05GnTk2AXayibpDJRSmkhjdvvfqlJyh9KNE'

const USERS = [
  { id: 'user_3CPh1iOr683Rizya7y3sNhkwskr', email: 'superadmin@lexflow.app', role: 'Super Admin' },
  { id: 'user_3CPh29oyvLBg3GvKYTfIOymr6Dv', email: 'admin@lexflow.app', role: 'Admin' },
  { id: 'user_3CPh2Q56Sxcxlc1ZUGM8KMQ9Hmw', email: 'abogado@lexflow.app', role: 'Abogado' },
  { id: 'user_3CPh2Wnh9p9fKpaxrG7SKQaFgdS', email: 'cliente@lexflow.app', role: 'Cliente' },
]

async function createSignInToken(userId: string, email: string, role: string) {
  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      redirect_url: 'http://localhost:3000/dashboard',
    }),
  })

  const data = await response.json()
  if (data.token) {
    return `https://sign-in.accounts.dev/sign-in-token/${data.token}`
  }
  throw new Error(`Error creando token para ${email}: ${JSON.stringify(data)}`)
}

async function main() {
  console.log('\n🔑 GENERANDO SIGN-IN TOKENS\n')
  console.log('='.repeat(70))

  for (const user of USERS) {
    try {
      const url = await createSignInToken(user.id, user.email, user.role)
      console.log(`\n👤 ${user.role}: ${user.email}`)
      console.log(`🔗 ${url}`)
    } catch (error) {
      console.error(`❌ Error con ${user.email}:`, error)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n💡 Usa estos links para iniciar sesión directamente sin contraseña.')
  console.log('⏰ Los tokens expiran en 30 días.\n')
}

main()
