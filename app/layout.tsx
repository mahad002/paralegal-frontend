import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { Inter } from 'next/font/google'
import { Layout } from '@/components/layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

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
          <ToastProvider>
            <Layout>
              {children}
            </Layout>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
