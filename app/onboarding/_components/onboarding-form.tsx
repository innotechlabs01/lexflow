'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, UserCog, Scale, User, Building, Loader2 } from 'lucide-react'

const ROLES = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Gestiona el bufete, usuarios y configuración',
    icon: UserCog,
    color: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
  },
  {
    value: 'lawyer',
    label: 'Abogado',
    description: 'Gestiona casos, clientes y documentos',
    icon: Scale,
    color: 'border-green-500 bg-green-50 hover:bg-green-100',
  },
  {
    value: 'client',
    label: 'Cliente',
    description: 'Accede a tus casos y documentos',
    icon: User,
    color: 'border-gray-500 bg-gray-50 hover:bg-gray-100',
  },
]

const ORGANIZATION_TYPES = [
  {
    value: 'new',
    label: 'Crear nueva organización',
    description: 'Inicia tu propio bufete o firma legal',
    icon: Building,
  },
  {
    value: 'existing',
    label: 'Unirme a organización existente',
    description: 'Ingresa el código de invitación',
    icon: UserCog,
  },
]

interface OnboardingFormProps {
  userId: string
  userEmail: string
  userName: string
}

export default function OnboardingForm({ userId, userEmail, userName }: OnboardingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<string>('')
  const [orgType, setOrgType] = useState<string>('')
  const [orgName, setOrgName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!role) {
      setError('Por favor selecciona un rol')
      return
    }

    if (step === 1) {
      setStep(2)
      setError('')
      return
    }

    if (step === 2 && !orgType) {
      setError('Por favor selecciona una opción')
      return
    }

    if (orgType === 'new' && !orgName.trim()) {
      setError('Por favor ingresa el nombre de la organización')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: userId,
          role,
          orgType,
          orgName: orgName.trim(),
          inviteCode: inviteCode.trim(),
          userName,
          userEmail,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al completar el registro')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          {step === 1 ? (
            <>
              <Shield className="h-5 w-5 text-primary-600" />
              <CardTitle>Selecciona tu rol</CardTitle>
            </>
          ) : (
            <>
              <Building className="h-5 w-5 text-primary-600" />
              <CardTitle>Configura tu organización</CardTitle>
            </>
          )}
        </div>
        <CardDescription>
          {step === 1
            ? '¿Cómo usarás LexFlow?'
            : '¿Tienes una organización o quieres crear una?'}
        </CardDescription>
        <div className="flex gap-1 mt-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 ? (
          <div className="grid gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    role === r.value
                      ? `${r.color} border-2`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${role === r.value ? 'bg-white/50' : 'bg-gray-100'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-sm text-gray-500">{r.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {ORGANIZATION_TYPES.map((org) => {
              const Icon = org.icon
              return (
                <button
                  key={org.value}
                  type="button"
                  onClick={() => setOrgType(org.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    orgType === org.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${orgType === org.value ? 'bg-white' : 'bg-gray-100'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{org.label}</p>
                    <p className="text-sm text-gray-500">{org.description}</p>
                  </div>
                </button>
              )
            })}

            {orgType === 'new' && (
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la organización</Label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Mi Bufete Legal"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {orgType === 'existing' && (
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Código de invitación</Label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="XXXX-XXXX"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Atrás
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : step === 1 ? (
              'Continuar'
            ) : (
              'Completar registro'
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Podrás cambiar estas configuraciones más adelante en Settings
        </p>
      </CardContent>
    </Card>
  )
}
