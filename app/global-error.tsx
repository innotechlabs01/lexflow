'use client'

import Link from 'next/link'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50">
          <div className="flex justify-between items-center h-16 px-6 max-w-full">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-blue-700">LexFlow</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px]" />

          <div className="relative w-full max-w-lg">
            <div className="bg-white rounded-xl p-8 md:p-12 text-center shadow-xl border border-gray-100 relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-red-50 text-red-600 relative">
                <div className="absolute inset-0 rounded-full border-2 border-red-500/10 animate-pulse" />
                <AlertTriangle className="w-10 h-10" />
              </div>

              <div className="space-y-4 mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  Algo salió mal
                </h1>
                <div className="flex justify-center">
                  <div className="h-1 w-12 bg-red-100 rounded-full opacity-30" />
                </div>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
                  Lo sentimos, hemos encontrado un error inesperado. Por favor, intenta de nuevo o contacta a soporte si el problema persiste.
                </p>
                {error?.digest && (
                  <p className="text-xs text-gray-400 font-mono">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={reset} className="w-full sm:w-auto gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Reintentar
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Home className="w-4 h-4" />
                    Ir al Dashboard
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Status Code</span>
                    <span className="text-sm font-medium text-gray-900">ERR_500_INTERNAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
