import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  en_preparacion: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default async function AdminDashboard() {
  const [productsRes, ordersRes, recentOrdersRes] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total', { count: 'exact' }),
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalProducts = productsRes.count ?? 0
  const totalOrders = ordersRes.count ?? 0
  const revenue = (ordersRes.data ?? []).reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  )
  const recentOrders = recentOrdersRes.data ?? []

  const stats = [
    { label: 'Productos', value: totalProducts, href: '/admin/productos' },
    { label: 'Pedidos', value: totalOrders, href: '/admin/pedidos' },
    { label: 'Ingresos', value: formatCOP(revenue), href: '/admin/pedidos' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-pink-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-pink-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Pedidos recientes
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            Ver todos &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No hay pedidos aun.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-medium text-pink-600 hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {order.customer_name ?? 'Sin nombre'}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {formatCOP(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
