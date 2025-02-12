import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import { Layout } from '@/components/layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paralegal System',
  description: 'A comprehensive legal case management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}