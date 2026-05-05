import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Seung-won Park',
  description: 'Machine Learning Engineer. Physics & CS at Seoul National University.',
  openGraph: {
    title: 'Seung-won Park',
    description: 'Machine Learning Engineer. Physics & CS at Seoul National University.',
    url: 'https://swpark.me',
    siteName: 'Seung-won Park',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
