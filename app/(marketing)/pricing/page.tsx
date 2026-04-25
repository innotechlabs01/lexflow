import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'para siempre',
    description: 'Para abogados independientes que comienzan',
    features: [
      '1 abogado',
      '10 clientes',
      '20 casos',
      '1 GB almacenamiento',
      'Portal de clientes básico',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'por mes',
    description: 'Para bufetes pequeños y medianos',
    features: [
      '5 abogados',
      '100 clientes',
      '500 casos',
      '50 GB almacenamiento',
      'Portal de clientes completo',
      'Integración Rama Judicial',
      'Automatizaciones ilimitadas',
      'Soporte prioritario',
    ],
    cta: 'Comenzar Prueba',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: 'por mes',
    description: 'Para firmas grandes',
    features: [
      'Abogados ilimitados',
      'Clientes ilimitados',
      'Casos ilimitados',
      '500 GB almacenamiento',
      'Todo lo de Pro',
      'API completa',
      'Personalización de marca',
      'Soporte dedicado 24/7',
    ],
    cta: 'Contactar Ventas',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">LexFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Comenzar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Planes para cada necesidad
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu bufete. Sin compromisos a largo plazo.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-8 shadow-sm border ${
                  plan.highlight
                    ? 'border-primary-500 ring-2 ring-primary-500 relative'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                    Más Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-600 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block mt-8">
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas un plan personalizado?
          </h2>
          <p className="text-gray-600 mb-6">
            Contáctanos para discutir necesidades específicas de tu firma.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Hablar con Ventas
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} LexFlow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}