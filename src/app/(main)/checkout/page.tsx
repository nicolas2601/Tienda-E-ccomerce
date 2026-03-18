'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import type { CheckoutData } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal)
  const generateWhatsAppUrl = useCartStore((state) => state.generateWhatsAppUrl)

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    address: '',
    city: '',
    department: '',
    postal_code: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const total = subtotal()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.customer_name.trim())
      newErrors.customer_name = 'El nombre es obligatorio'
    if (!formData.customer_phone.trim())
      newErrors.customer_phone = 'El telefono es obligatorio'
    if (!formData.city.trim()) newErrors.city = 'La ciudad es obligatoria'
    if (!formData.address.trim())
      newErrors.address = 'La direccion es obligatoria'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const checkoutData: CheckoutData = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      shipping_address: {
        full_name: formData.customer_name,
        address: formData.address,
        city: formData.city,
        department: formData.department,
        postal_code: formData.postal_code,
        phone: formData.customer_phone,
      },
      notes: formData.notes,
    }

    const whatsappUrl = generateWhatsAppUrl(checkoutData)
    window.open(whatsappUrl, '_blank')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  if (items.length === 0) {
    return (
      <main className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          No hay productos en tu carrito
        </h1>
        <p className="text-gray-500 mb-6">
          Agrega productos antes de finalizar la compra.
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
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Finalizar compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4">Datos del comprador</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium mb-1"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      errors.customer_name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customer_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customer_phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Telefono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      errors.customer_phone
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="300 123 4567"
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customer_phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="customer_email"
                    className="block text-sm font-medium mb-1"
                  >
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="tu@correo.com (opcional)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium mb-1"
                  >
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu ciudad"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium mb-1"
                  >
                    Departamento
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Departamento"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postal_code"
                    className="block text-sm font-medium mb-1"
                  >
                    Codigo postal
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Codigo postal (opcional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium mb-1"
                  >
                    Direccion de envio *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Direccion completa"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium mb-1"
                  >
                    Notas adicionales
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="Indicaciones especiales de entrega, etc."
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-green-50">
              <h2 className="font-bold text-lg mb-2">Metodo de compra</h2>
              <p className="text-sm text-gray-600">
                Al hacer clic en &quot;Pedir por WhatsApp&quot;, se abrira una
                conversacion de WhatsApp con el resumen de tu pedido. Alli
                coordinaremos el pago y el envio.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">Resumen del pedido</h2>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.product_id}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden">
                      {item.product.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {item.size && `Talla: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Cant: {item.quantity}
                      </p>
                      <p className="font-medium mt-1">
                        {formatCOP(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCOP(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envio</span>
                  <span className="text-gray-500">Por confirmar</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCOP(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-green-600 text-white text-center py-4 font-bold uppercase rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Pedir por WhatsApp
              </button>

              <Link
                href="/carrito"
                className="mt-3 block text-center text-sm text-gray-500 hover:underline"
              >
                Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}
