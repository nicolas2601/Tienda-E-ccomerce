import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import { logoutAction } from '../actions'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/categorias', label: 'Categorias' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await verifySession()
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-pink-100 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-pink-100 px-6 py-5">
            <Link href="/admin" className="text-xl font-bold text-pink-600">
              GUAP@S Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-pink-50 hover:text-pink-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout + Back to store */}
          <div className="border-t border-pink-100 px-3 py-4 space-y-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Cerrar sesion
              </button>
            </form>
            <Link
              href="/"
              className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              &larr; Volver a la tienda
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
