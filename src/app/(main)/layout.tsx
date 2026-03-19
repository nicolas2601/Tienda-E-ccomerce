import Link from 'next/link'
import Image from 'next/image'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}

function SiteHeader() {
  return (
    <header className="border-b" data-testid="header">
      <div className="container flex items-center justify-between py-3 px-4 lg:px-8">
        <Link href="/" className="text-2xl font-bold" data-testid="header-logo-link">
          <Image
            src="/Logo.svg"
            width={160}
            height={40}
            alt="GUAP@S"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium uppercase" aria-label="Navegacion principal">
          <Link href="/productos" className="hover:underline">
            Productos
          </Link>
          <Link href="/categorias/mujer" className="hover:underline">
            Mujer
          </Link>
          <Link href="/categorias/hombre" className="hover:underline">
            Hombre
          </Link>
          <Link href="/categorias/ninos" className="hover:underline">
            Ninos
          </Link>
          <Link href="/categorias/ofertas" className="hover:underline text-red-600">
            Ofertas
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/carrito"
            className="relative flex items-center gap-1 text-sm font-medium"
            data-testid="header-cart-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto gap-4 px-4 py-2 border-t text-xs font-medium uppercase" aria-label="Navegacion movil">
        <Link href="/productos" className="whitespace-nowrap">
          Productos
        </Link>
        <Link href="/categorias/mujer" className="whitespace-nowrap">
          Mujer
        </Link>
        <Link href="/categorias/hombre" className="whitespace-nowrap">
          Hombre
        </Link>
        <Link href="/categorias/ninos" className="whitespace-nowrap">
          Ninos
        </Link>
        <Link href="/categorias/ofertas" className="whitespace-nowrap text-red-600">
          Ofertas
        </Link>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-gray-50 mt-12 border-t" data-testid="footer">
      <div className="container px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-bold text-lg mb-4">GUAP@S</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Moda importada de Canada para toda la familia. Envios a toda
              Colombia.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase mb-4">Tienda</h3>
            <nav className="space-y-2" aria-label="Enlaces de la tienda">
              <Link
                href="/productos"
                className="block text-sm text-gray-600 hover:underline"
              >
                Todos los productos
              </Link>
              <Link
                href="/categorias/mujer"
                className="block text-sm text-gray-600 hover:underline"
              >
                Mujer
              </Link>
              <Link
                href="/categorias/hombre"
                className="block text-sm text-gray-600 hover:underline"
              >
                Hombre
              </Link>
              <Link
                href="/categorias/ninos"
                className="block text-sm text-gray-600 hover:underline"
              >
                Ninos
              </Link>
              <Link
                href="/categorias/ofertas"
                className="block text-sm text-gray-600 hover:underline"
              >
                Ofertas
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase mb-4">Contacto</h3>
            <nav className="space-y-2" aria-label="Informacion de contacto">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:underline"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@guapas.co'}`}
                className="block text-sm text-gray-600 hover:underline"
              >
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@guapas.co'}
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} GUAP@S. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
