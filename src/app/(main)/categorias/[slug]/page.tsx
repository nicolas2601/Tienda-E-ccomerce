import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Script from 'next/script'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) return {}

  const title = `${category.name} - GUAP@S`
  const description =
    category.description ||
    `Encuentra los mejores productos de ${category.name} en GUAP@S. Moda importada de Canada.`

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/categorias/${slug}`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/categorias/${slug}`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'GUAP@S',
      type: 'website',
      locale: 'es_CO',
    },
  }
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    return notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // JSON-LD ItemList
  const itemList = (products || []).slice(0, 8).map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: `${baseUrl}/productos/${p.slug}`,
    name: p.name,
  }))

  return (
    <main className="container py-6">
      <Script
        id="ld-breadcrumbs-categoria"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: `${baseUrl}/categorias/${slug}`,
              },
            ],
          }),
        }}
      />
      <Script
        id="ld-itemlist-categoria"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: itemList,
          }),
        }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/productos" className="hover:underline">
              Productos
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-800">{category.name}</li>
        </ol>
      </nav>

      <h1 className="heading-xl uppercase mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-6 max-w-2xl">{category.description}</p>
      )}

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                <h3 className="font-medium text-sm mt-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold">{formatCOP(product.price)}</span>
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
            No hay productos en esta categoria por el momento.
          </p>
          <Link
            href="/productos"
            className="mt-4 inline-block text-sm underline"
          >
            Ver todos los productos
          </Link>
        </div>
      )}
    </main>
  )
}
