import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
        <p className="text-gray-500 mt-2">
          Registra tu bufete y comienza gratis
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full',
            card: 'shadow-none border-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
            formButtonPrimary: 'w-full bg-primary-600 hover:bg-primary-700',
            formFieldInput: 'rounded-lg border-gray-300',
            formFieldLabel: 'text-gray-700 font-medium',
            footerActionLink: 'text-primary-600 hover:text-primary-700',
          },
        }}
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}