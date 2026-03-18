import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

export default async function AdminProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-red-600">Error cargando productos: {error.message}</div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700"
        >
          Agregar producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm">
        {!products || products.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No hay productos aun.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Precio</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3">Activo</th>
                  <th className="px-6 py-3">Destacado</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {formatCOP(product.price)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          product.stock <= 0
                            ? 'font-medium text-red-600'
                            : product.stock <= 5
                              ? 'font-medium text-yellow-600'
                              : 'text-gray-700'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {(product.category as any)?.name ?? '\u2014'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.is_featured
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_featured ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline"
                      >
                        Editar
                      </Link>
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
