import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Who's Playing — Live local music",
  description: 'Discover live music near you. For artists, venues, and music-goers.',
  themeColor: '#0AA3A3',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
