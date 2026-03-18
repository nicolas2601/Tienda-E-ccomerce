'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/database'

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
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

const paymentStatusColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
  reembolsado: 'bg-orange-100 text-orange-800',
}

const allStatuses: Order['status'][] = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelado',
]

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingWhatsapp, setUpdatingWhatsapp] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        toast.error('Pedido no encontrado')
      } else {
        setOrder(data as Order)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) throw error

      setOrder({ ...order, status: newStatus })
      toast.success('Estado actualizado')
    } catch (err: any) {
      toast.error(err.message ?? 'Error actualizando estado')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleMarkWhatsapp = async () => {
    if (!order) return
    setUpdatingWhatsapp(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          whatsapp_sent: true,
          whatsapp_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) throw error

      setOrder({
        ...order,
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString(),
      })
      toast.success('Marcado como WhatsApp enviado')
    } catch (err: any) {
      toast.error(err.message ?? 'Error actualizando')
    } finally {
      setUpdatingWhatsapp(false)
    }
  }

  const getWhatsAppLink = () => {
    if (!order?.customer_phone) return null
    const phone = order.customer_phone.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(
      `Hola ${order.customer_name ?? ''}, te contactamos desde GUAP@S respecto a tu pedido #${order.id.slice(0, 8)}. Total: ${formatCOP(order.total)}`
    )
    return `https://wa.me/${phone}?text=${message}`
  }

  const sectionCls = 'rounded-xl border border-pink-100 bg-white p-6 shadow-sm'
  const labelCls = 'text-sm font-medium text-gray-500'
  const valueCls = 'text-sm text-gray-900'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Pedido no encontrado</p>
        <Link
          href="/admin/pedidos"
          className="mt-4 inline-block text-sm text-pink-600 hover:underline"
        >
          Volver a pedidos
        </Link>
      </div>
    )
  }

  const address = order.shipping_address
  const whatsappLink = getWhatsAppLink()

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/pedidos"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{order.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order info */}
          <div className={sectionCls}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Informacion del pedido
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={labelCls}>Estado</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className={labelCls}>Estado de pago</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColors[order.payment_status] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {order.payment_status}
                </span>
              </div>
              <div>
                <p className={labelCls}>Metodo de pago</p>
                <p className={valueCls}>{order.payment_method ?? '\u2014'}</p>
              </div>
              <div>
                <p className={labelCls}>Referencia de pago</p>
                <p className={valueCls}>{order.payment_reference ?? '\u2014'}</p>
              </div>
              <div>
                <p className={labelCls}>Creado</p>
                <p className={valueCls}>{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className={labelCls}>Numero de seguimiento</p>
                <p className={valueCls}>{order.tracking_number ?? '\u2014'}</p>
              </div>
              {order.coupon_code && (
                <div>
                  <p className={labelCls}>Cupon</p>
                  <p className={valueCls}>{order.coupon_code}</p>
                </div>
              )}
              {order.notes && (
                <div className="col-span-2">
                  <p className={labelCls}>Notas</p>
                  <p className={valueCls}>{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className={sectionCls}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Productos
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.size && `Talla: ${item.size}`}
                      {item.size && item.color && ' | '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCOP(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-right text-sm">
              <p className="text-gray-500">
                Subtotal: <span className="text-gray-900">{formatCOP(order.subtotal)}</span>
              </p>
              <p className="text-gray-500">
                Envio: <span className="text-gray-900">{formatCOP(order.shipping_cost)}</span>
              </p>
              {order.tax > 0 && (
                <p className="text-gray-500">
                  Impuestos: <span className="text-gray-900">{formatCOP(order.tax)}</span>
                </p>
              )}
              {order.discount_amount > 0 && (
                <p className="text-gray-500">
                  Descuento: <span className="text-green-600">-{formatCOP(order.discount_amount)}</span>
                </p>
              )}
              <p className="text-lg font-bold text-gray-900">
                Total: {formatCOP(order.total)}
              </p>
            </div>
          </div>

          {/* Shipping address */}
          {address && (
            <div className={sectionCls}>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Direccion de envio
              </h2>
              <div className="space-y-1 text-sm text-gray-700">
                {address.full_name && <p className="font-medium">{address.full_name}</p>}
                {address.address && <p>{address.address}</p>}
                {(address.city || address.department) && (
                  <p>
                    {address.city}
                    {address.city && address.department && ', '}
                    {address.department}
                  </p>
                )}
                {address.postal_code && <p>CP: {address.postal_code}</p>}
                {address.phone && <p>Tel: {address.phone}</p>}
                {address.notes && (
                  <p className="mt-2 text-gray-500">Notas: {address.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Status update */}
          <div className={sectionCls}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Cambiar estado
            </h2>
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as Order['status'])
              }
              disabled={updatingStatus}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 disabled:opacity-50"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Customer info */}
          <div className={sectionCls}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Cliente
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className={labelCls}>Nombre: </span>
                <span className={valueCls}>
                  {order.customer_name ?? '\u2014'}
                </span>
              </p>
              <p>
                <span className={labelCls}>Telefono: </span>
                <span className={valueCls}>
                  {order.customer_phone ?? '\u2014'}
                </span>
              </p>
              <p>
                <span className={labelCls}>Email: </span>
                <span className={valueCls}>
                  {order.customer_email ?? '\u2014'}
                </span>
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className={sectionCls}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              WhatsApp
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Estado:{' '}
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.whatsapp_sent
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {order.whatsapp_sent ? 'Enviado' : 'No enviado'}
                </span>
              </p>
              {order.whatsapp_sent_at && (
                <p className="text-xs text-gray-400">
                  Enviado: {formatDate(order.whatsapp_sent_at)}
                </p>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  Contactar por WhatsApp
                </a>
              )}
              {!order.whatsapp_sent && (
                <button
                  onClick={handleMarkWhatsapp}
                  disabled={updatingWhatsapp}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {updatingWhatsapp
                    ? 'Actualizando...'
                    : 'Marcar como WhatsApp enviado'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
