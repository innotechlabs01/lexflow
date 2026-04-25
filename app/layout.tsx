import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LexFlow - Gestión Legal Inteligente',
    template: '%s | LexFlow',
  },
  description: 'Plataforma SaaS de gestión legal para bufetes de abogados en Latinoamérica',
  keywords: ['gestión legal', 'bufetes de abogados', 'software abogados', 'casos legales', 'Latinoamérica'],
  authors: [{ name: 'LexFlow' }],
  creator: 'LexFlow',
  publisher: 'LexFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'LexFlow - Gestión Legal Inteligente',
    description: 'Plataforma SaaS de gestión legal para bufetes de abogados en Latinoamérica',
    url: 'https://lexflow.app',
    siteName: 'LexFlow',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexFlow - Gestión Legal Inteligente',
    description: 'Plataforma SaaS de gestión legal para bufetes de abogados en Latinoamérica',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}