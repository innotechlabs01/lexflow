import Link from 'next/link'
import {
  Briefcase,
  Users,
  FileText,
  Calendar,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Briefcase,
    title: 'Gestión de Casos',
    description: 'Organiza y supervisa todos tus casos legales en un solo lugar con seguimiento completo del proceso judicial.',
  },
  {
    icon: Users,
    title: 'Portal de Clientes',
    description: 'Tus clientes pueden acceder a sus casos, documentos y comunicaciones en tiempo real.',
  },
  {
    icon: FileText,
    title: 'Documentos Seguros',
    description: 'Almacenamiento cifrado en la nube con control de versiones y acceso granular.',
  },
  {
    icon: Calendar,
    title: 'Agenda Judicial',
    description: 'Calendario inteligente con recordatorios automáticos para audiencias y plazos.',
  },
  {
    icon: Shield,
    title: 'Seguridad Multi-Tenant',
    description: 'Cada bufete tiene su espacio aislado con acceso seguro y encriptación de datos.',
  },
  {
    icon: Zap,
    title: 'Automatización',
    description: 'Integración con Rama Judicial y notificaciones automáticas por WhatsApp y Email.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Para abogados independientes',
    features: [
      '1 abogado',
      '10 clientes',
      '20 casos',
      '1 GB almacenamiento',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'Para bufetes pequeños y medianos',
    features: [
      '5 abogados',
      '100 clientes',
      '500 casos',
      '50 GB almacenamiento',
      'Portal de clientes',
      'Integración Rama Judicial',
      '10 automatizaciones',
      'Soporte prioritario',
    ],
    cta: 'Comenzar Prueba',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'Para firmas grandes',
    features: [
      'Abogados ilimitados',
      'Clientes ilimitados',
      'Casos ilimitados',
      '500 GB almacenamiento',
      'Todo lo de Pro',
      '100 automatizaciones',
      'API completa',
      'Soporte dedicado',
    ],
    cta: 'Contactar Ventas',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">LexFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Características</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Precios</Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">Nosotros</Link>
          </nav>
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Gestión Legal{' '}
            <span className="text-primary-600">Inteligente</span>
            <br />
            para tu Bufete
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            La plataforma SaaS que transforma la gestión de casos legales. Organiza clientes, documentos y audiencias en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Comenzar Gratis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Ver Características
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-sm text-gray-600">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-sm text-gray-600">14 días de prueba</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-sm text-gray-600">Cancelación en cualquier momento</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Todo lo que necesitas para gestionar tu bufete
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas específicamente para abogados y firmas legales en Latinoamérica.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">500+</p>
              <p className="mt-2 text-gray-600">Bufetes activos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">50,000+</p>
              <p className="mt-2 text-gray-600">Casos gestionados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">99.9%</p>
              <p className="mt-2 text-gray-600">Uptime garantizado</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">24/7</p>
              <p className="mt-2 text-gray-600">Soporte técnico</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Planes para cada necesidad
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu bufete. Sin compromisos.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-8 shadow-sm border ${
                  plan.highlight
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
                    Más Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-gray-600">/mes</span>}
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4 text-success-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="block mt-8">
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para transformar tu práctica legal?
          </h2>
          <p className="mt-4 text-primary-100 max-w-2xl mx-auto">
            Únete a cientos de bufetes que ya están usando LexFlow para gestionar sus casos de manera más eficiente.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">
                Ver Precios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <span className="text-lg font-bold text-white">L</span>
                </div>
                <span className="text-xl font-semibold text-white">LexFlow</span>
              </div>
              <p className="text-sm">
                Plataforma de gestión legal para bufetes de abogados en Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Precios</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Registro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-white">Nosotros</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Carreras</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Términos de Servicio</Link></li>
                <li><Link href="#" className="hover:text-white">Política de Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} LexFlow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}