import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Complynt — Compliance Tracking for Hospitality & F&B',
  description: 'Track every licence, deadline, and compliance obligation from one dashboard. Built for hospitality businesses in India, Australia, and the UK.',
}

export const viewport: Viewport = {
  themeColor: '#0071e3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
