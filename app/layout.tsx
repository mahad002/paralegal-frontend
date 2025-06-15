import { Inter } from 'next/font/google'
import { Layout } from '@/components/layout'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { SplashProvider } from '@/contexts/SplashContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Paralegal Assistant - Professional Legal Case Management',
  description: 'A modern, professional web application for legal professionals to manage cases, analyze documents, and ensure compliance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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