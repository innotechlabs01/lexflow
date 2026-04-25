import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LexFlow - Gestión Legal Inteligente',
  description: 'Plataforma SaaS de gestión legal para bufetes de abogados en Latinoamérica',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}