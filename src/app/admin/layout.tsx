import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | GUAP@S Admin',
    default: 'GUAP@S Admin'
  }
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
