import { supabase } from '@/lib/supabase'
import { Hero } from '@/components/sections'
import type { Metadata } from 'next'
import Script from 'next/script'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GUAP@S'
  const title = 'GUAP@S - Moda importada de Canada para toda la familia'
  const description =
    'Tienda online de ropa y accesorios importados de Canada. Moda para mujer, hombre y ninos. Envios a toda Colombia.'

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName,
      type: 'website',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export const revalidate = 60

export default async function HomePage() {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'GUAP@S'

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <main className="flex flex-col gap-8 items-center text-primary">
      {/* Organization JSON-LD */}
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url: baseUrl,
            logo: `${baseUrl}/favicon.ico`,
            description:
              'Tienda online de ropa y accesorios importados de Canada.',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'CO',
            },
          }),
        }}
      />
      {/* WebSite JSON-LD */}
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: baseUrl,
            inLanguage: 'es-CO',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/productos?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <Hero
        image="/images/hero/Image.jpg"
        heading="Moda importada de Canada para toda la familia"
        paragraph="Descubre nuestra coleccion de ropa y accesorios de las mejores marcas canadienses. Envios a toda Colombia."
        buttons={[
          { label: 'Ver productos', path: '/productos' },
          { label: 'Ofertas', path: '/categorias/ofertas' },
        ]}
      />

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="px-4 lg:px-8 w-full">
          <h2 className="heading-xl uppercase mb-6 text-center">
            Compra por categoria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorias/${cat.slug}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-400 transition-all duration-300 aspect-square flex items-end"
              >
                {cat.image_url && (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                  />
                )}
                <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-bold text-lg uppercase">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="px-4 lg:px-8 w-full">
          <h2 className="heading-xl uppercase mb-6 text-center">
            Productos destacados
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
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
                    <span className="font-bold text-base">
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
          <div className="text-center mt-8">
            <Link
              href="/productos"
              className="inline-block border-2 border-black px-8 py-3 font-bold uppercase hover:bg-black hover:text-white transition-colors duration-300"
            >
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
