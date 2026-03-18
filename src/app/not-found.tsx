import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagina no encontrada',
  description: 'La pagina que buscas no existe.',
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-24">
      <h1 className="text-2xl font-bold">Pagina no encontrada</h1>
      <p className="text-gray-500">
        La pagina que intentas visitar no existe.
      </p>
      <Link
        className="inline-block border-2 border-black px-6 py-3 font-bold uppercase hover:bg-black hover:text-white transition-colors"
        href="/"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
