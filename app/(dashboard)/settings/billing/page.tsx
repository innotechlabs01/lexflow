import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAuthContext } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Para abogados independientes',
    features: ['1 abogado', '10 clientes', '20 casos', '1 GB'],
  },
  {
    name: 'Pro',
    price: 49,
    description: 'Para bufetes pequeños',
    features: ['5 abogados', '100 clientes', '500 casos', '50 GB', 'Portal clientes', 'Rama Judicial'],
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'Para firmas grandes',
    features: ['Abogados ilimitados', 'Clientes ilimitados', 'Casos ilimitados', '500 GB', 'API Access', 'Soporte dedicado'],
  },
]

const rolePlanConfig: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default async function BillingSettingsPage() {
  const ctx = await getAuthContext()
  
  if (!ctx) {
    redirect('/sign-in')
  }

  const currentPlan = 'pro'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
          <CardDescription>Tu suscripción activa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary-200 bg-primary-50">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary-100">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">{currentPlan} Plan</span>
                  <Badge variant="default">Activo</Badge>
                </div>
                <p className="text-sm text-gray-500">${plans.find(p => p.name.toLowerCase() === currentPlan.toLowerCase())?.price || 49}/mes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name.toLowerCase() === currentPlan.toLowerCase() ? 'border-primary border-2' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                    <Badge variant="secondary" className="h-1 w-1 p-0 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.name.toLowerCase() !== currentPlan.toLowerCase() && (
                <Button className="w-full" variant="outline">
                  Cambiar a {plan.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}