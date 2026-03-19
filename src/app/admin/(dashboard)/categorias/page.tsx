import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function AdminCategoriasPage() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })

  if (error) {
    return (
      <div className="text-red-600">
        Error cargando categorias: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <Link
          href="/admin/categorias/nuevo"
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700"
        >
          Agregar categoria
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm">
        {!categories || categories.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No hay categorias aun.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Orden</th>
                  <th className="px-6 py-3">Activa</th>
                  <th className="px-6 py-3">Padre</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {cat.sort_order ?? '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cat.is_active ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {cat.parent_id
                        ? categories.find((c) => c.id === cat.parent_id)
                            ?.name ?? cat.parent_id.slice(0, 8)
                        : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/categorias/${cat.id}/editar`}
                        className="text-sm font-medium text-pink-600 hover:text-pink-700"
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
