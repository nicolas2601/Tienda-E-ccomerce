import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import Script from 'next/script'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

const PRODUCTS_PER_PAGE = 12

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  return {
    title: 'Productos - GUAP@S',
    description:
      'Explora nuestra coleccion completa de ropa y accesorios importados de Canada. Moda para mujer, hombre y ninos.',
    alternates: {
      canonical: `${baseUrl}/productos`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Productos | GUAP@S',
      description:
        'Explora nuestra coleccion completa de ropa y accesorios importados de Canada.',
      url: `${baseUrl}/productos`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'GUAP@S',
      type: 'website',
      locale: 'es_CO',
    },
  }
}

export const revalidate = 60

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    categoria?: string
    genero?: string
    talla?: string
    q?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const offset = (page - 1) * PRODUCTS_PER_PAGE

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  // Build product query
  let query = supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)', { count: 'exact' })
    .eq('is_active', true)

  if (params.categoria) {
    // Filter by category slug via subquery
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.categoria)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (params.genero) {
    query = query.eq('gender', params.genero)
  }

  if (params.talla) {
    query = query.contains('sizes', [params.talla])
  }

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  const { data: products, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + PRODUCTS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / PRODUCTS_PER_PAGE)

  // JSON-LD ItemList
  const itemList = (products || []).map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: `${baseUrl}/productos/${p.slug}`,
    name: p.name,
  }))

  // Build filter URL helper
  const buildFilterUrl = (key: string, value: string) => {
    const current = new URLSearchParams()
    if (params.categoria) current.set('categoria', params.categoria)
    if (params.genero) current.set('genero', params.genero)
    if (params.talla) current.set('talla', params.talla)
    if (params.q) current.set('q', params.q)

    if (current.get(key) === value) {
      current.delete(key)
    } else {
      current.set(key, value)
    }
    current.delete('page')
    const qs = current.toString()
    return `/productos${qs ? `?${qs}` : ''}`
  }

  return (
    <main className="container py-6">
      <Script
        id="ld-itemlist-productos"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: itemList,
          }),
        }}
      />

      <h1 className="heading-xl uppercase mb-6">Productos</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-4 space-y-6">
            {/* Search */}
            <form action="/productos" method="GET">
              <label htmlFor="search" className="block font-bold text-sm uppercase mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                name="q"
                defaultValue={params.q || ''}
                placeholder="Buscar productos..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </form>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div>
                <h3 className="font-bold text-sm uppercase mb-2">Categorias</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/productos"
                      className={`text-sm hover:underline ${!params.categoria ? 'font-bold' : ''}`}
                    >
                      Todas
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={buildFilterUrl('categoria', cat.slug)}
                        className={`text-sm hover:underline ${params.categoria === cat.slug ? 'font-bold' : ''}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gender Filter */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-2">Genero</h3>
              <ul className="space-y-1">
                {['mujer', 'hombre', 'ninos', 'unisex'].map((g) => (
                  <li key={g}>
                    <Link
                      href={buildFilterUrl('genero', g)}
                      className={`text-sm hover:underline capitalize ${params.genero === g ? 'font-bold' : ''}`}
                    >
                      {g === 'ninos' ? 'Ninos' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active filters */}
          {(params.categoria || params.genero || params.talla || params.q) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {params.q && (
                <Link
                  href={buildFilterUrl('q', params.q)}
                  className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  Busqueda: {params.q} <span className="text-gray-500">x</span>
                </Link>
              )}
              {params.categoria && (
                <Link
                  href={buildFilterUrl('categoria', params.categoria)}
                  className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  Categoria: {params.categoria}{' '}
                  <span className="text-gray-500">x</span>
                </Link>
              )}
              {params.genero && (
                <Link
                  href={buildFilterUrl('genero', params.genero)}
                  className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  Genero: {params.genero}{' '}
                  <span className="text-gray-500">x</span>
                </Link>
              )}
              {params.talla && (
                <Link
                  href={buildFilterUrl('talla', params.talla)}
                  className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  Talla: {params.talla}{' '}
                  <span className="text-gray-500">x</span>
                </Link>
              )}
              <Link
                href="/productos"
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
              >
                Limpiar filtros
              </Link>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">
            {count || 0} producto{(count || 0) !== 1 ? 's' : ''} encontrado
            {(count || 0) !== 1 ? 's' : ''}
          </p>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/productos/${product.slug}`}
                  className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      />
                    )}
                    {product.compare_at_price &&
                      product.compare_at_price > product.price && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          OFERTA
                        </span>
                      )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 uppercase">
                      {product.category?.name}
                    </p>
                    <h3 className="font-medium text-sm mt-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold">
                        {formatCOP(product.price)}
                      </span>
                      {product.compare_at_price &&
                        product.compare_at_price > product.price && (
                          <span className="text-gray-400 line-through text-sm">
                            {formatCOP(product.compare_at_price)}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron productos.
              </p>
              <Link
                href="/productos"
                className="mt-4 inline-block text-sm underline"
              >
                Ver todos los productos
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-8" aria-label="Paginacion">
              {page > 1 && (
                <Link
                  href={`/productos?${new URLSearchParams({
                    ...(params.categoria ? { categoria: params.categoria } : {}),
                    ...(params.genero ? { genero: params.genero } : {}),
                    ...(params.talla ? { talla: params.talla } : {}),
                    ...(params.q ? { q: params.q } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
                >
                  Anterior
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 2 && p <= page + 2)
                )
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 py-2 text-sm">...</span>
                    )}
                    <Link
                      href={`/productos?${new URLSearchParams({
                        ...(params.categoria
                          ? { categoria: params.categoria }
                          : {}),
                        ...(params.genero ? { genero: params.genero } : {}),
                        ...(params.talla ? { talla: params.talla } : {}),
                        ...(params.q ? { q: params.q } : {}),
                        page: String(p),
                      }).toString()}`}
                      className={`px-4 py-2 border rounded text-sm ${
                        p === page
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < totalPages && (
                <Link
                  href={`/productos?${new URLSearchParams({
                    ...(params.categoria ? { categoria: params.categoria } : {}),
                    ...(params.genero ? { genero: params.genero } : {}),
                    ...(params.talla ? { talla: params.talla } : {}),
                    ...(params.q ? { q: params.q } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
                >
                  Siguiente
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </main>
  )
}
