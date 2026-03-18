import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalCartItem, Product, CheckoutData } from '@/types/database'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '3153719777'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function matchesVariant(
  item: LocalCartItem,
  productId: string,
  size: string | null,
  color: string | null,
): boolean {
  return (
    item.product_id === productId &&
    item.size === size &&
    item.color === color
  )
}

interface CartStore {
  items: LocalCartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product, quantity: number, size: string | null, color: string | null) => void
  removeItem: (productId: string, size: string | null, color: string | null) => void
  updateQuantity: (productId: string, size: string | null, color: string | null, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  totalItems: () => number
  subtotal: () => number

  // WhatsApp checkout
  generateWhatsAppUrl: (checkout: CheckoutData) => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity, size, color) => {
        set((state) => {
          const existing = state.items.find((item) =>
            matchesVariant(item, product.id, size, color),
          )

          if (existing) {
            return {
              items: state.items.map((item) =>
                matchesVariant(item, product.id, size, color)
                  ? { ...item, quantity: item.quantity + quantity, product }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                product,
                quantity,
                size,
                color,
              },
            ],
          }
        })
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !matchesVariant(item, productId, size, color),
          ),
        }))
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            matchesVariant(item, productId, size, color)
              ? { ...item, quantity }
              : item,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        )
      },

      generateWhatsAppUrl: (checkout) => {
        const { items } = get()
        const subtotal = get().subtotal()

        const lines: string[] = [
          'Hola! Quiero hacer un pedido en GUAP@S',
          '',
          '*Productos:*',
        ]

        items.forEach((item, index) => {
          const details: string[] = []
          if (item.size) details.push(`Talla: ${item.size}`)
          if (item.color) details.push(`Color: ${item.color}`)

          const itemTotal = item.product.price * item.quantity
          lines.push(
            `${index + 1}. ${item.product.name}` +
              (details.length > 0 ? ` (${details.join(', ')})` : '') +
              ` x${item.quantity} - ${formatCurrency(itemTotal)}`,
          )
        })

        lines.push('', `*Subtotal:* ${formatCurrency(subtotal)}`)

        lines.push(
          '',
          '*Datos del cliente:*',
          `Nombre: ${checkout.customer_name}`,
          `Tel: ${checkout.customer_phone}`,
          `Email: ${checkout.customer_email}`,
        )

        const addr = checkout.shipping_address
        if (addr.address || addr.city || addr.department) {
          lines.push('', '*Direccion de envio:*')
          if (addr.full_name) lines.push(`Nombre: ${addr.full_name}`)
          if (addr.address) lines.push(`Direccion: ${addr.address}`)
          if (addr.city) lines.push(`Ciudad: ${addr.city}`)
          if (addr.department) lines.push(`Departamento: ${addr.department}`)
          if (addr.postal_code) lines.push(`Codigo postal: ${addr.postal_code}`)
          if (addr.phone) lines.push(`Tel: ${addr.phone}`)
        }

        if (checkout.notes) {
          lines.push('', `*Notas:* ${checkout.notes}`)
        }

        const message = lines.join('\n')
        const encoded = encodeURIComponent(message)

        return `https://wa.me/57${WHATSAPP_NUMBER}?text=${encoded}`
      },
    }),
    {
      name: 'guapas-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
