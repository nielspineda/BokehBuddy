import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bokeh Buddy — Photography Session Planner',
  description: 'Plan your photography sessions with gear recommendations, shot ideas, and lens suggestions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
