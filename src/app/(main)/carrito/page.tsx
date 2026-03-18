'use client'

import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export default function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.subtotal)
  const totalItems = useCartStore((state) => state.totalItems)
  const clearCart = useCartStore((state) => state.clearCart)

  const total = subtotal()
  const count = totalItems()

  if (items.length === 0) {
    return (
      <main className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito esta vacio</h1>
        <p className="text-gray-500 mb-6">
          Agrega productos para comenzar tu compra.
        </p>
        <Link
          href="/productos"
          className="inline-block border-2 border-black px-8 py-3 font-bold uppercase hover:bg-black hover:text-white transition-colors"
        >
          Ver productos
        </Link>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.size}-${item.color}`}
              className="flex gap-4 border rounded-lg p-4"
            >
              {/* Product Image */}
              <Link
                href={`/productos/${item.product.slug}`}
                className="relative w-24 h-32 shrink-0 overflow-hidden rounded"
              >
                {item.product.images?.[0] && (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </Link>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/productos/${item.product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1 space-x-3">
                    {item.size && <span>Talla: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity controls */}
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product_id,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100 text-sm"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product_id,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100 text-sm"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold">
                    {formatCOP(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.product_id, item.size, item.color)}
                className="text-gray-400 hover:text-red-600 self-start"
                aria-label={`Eliminar ${item.product.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:underline"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4">Resumen del pedido</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({count} articulo{count !== 1 ? 's' : ''})
                </span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envio</span>
                <span className="text-sm text-gray-500">
                  Calculado al finalizar
                </span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full bg-black text-white text-center py-4 font-bold uppercase rounded hover:bg-gray-800 transition-colors"
            >
              Finalizar compra
            </Link>

            <Link
              href="/productos"
              className="mt-3 block text-center text-sm text-gray-500 hover:underline"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
