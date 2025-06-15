import { Inter } from 'next/font/google'
import { Layout } from '@/components/layout'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SplashProvider } from '@/contexts/SplashContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Paralegal | Where Justice is served',
  description: 'A comprehensive legal case management and compliance analysis platform for legal professionals',
  keywords: 'legal, paralegal, case management, compliance, due diligence, legal analysis, law firm',
  authors: [{ name: 'Paralegal Team' }],
  creator: 'Paralegal',
  publisher: 'Paralegal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
  openGraph: {
    title: 'Paralegal | Where Justice is served',
    description: 'A comprehensive legal case management and compliance analysis platform for legal professionals',
    url: 'https://paralegal.com',
    siteName: 'Paralegal',
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 630,
        alt: 'Paralegal - Where Justice is served',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paralegal | Where Justice is served',
    description: 'A comprehensive legal case management and compliance analysis platform for legal professionals',
    images: ['/image.png'],
    creator: '@paralegal',
  },
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/image.png" sizes="any" />
        <link rel="apple-touch-icon" href="/image.png" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <SplashProvider>
            <Layout>
              {children}
            </Layout>
            <Toaster />
          </SplashProvider>
        </AuthProvider>
      </body>
    </html>
  )
}