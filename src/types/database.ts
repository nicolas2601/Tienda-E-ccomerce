export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id'>>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CartItem, 'id'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id'>>
      }
      wishlist: {
        Row: WishlistItem
        Insert: Omit<WishlistItem, 'id' | 'created_at'>
        Update: Partial<Omit<WishlistItem, 'id'>>
      }
      coupons: {
        Row: Coupon
        Insert: Omit<Coupon, 'id' | 'created_at'>
        Update: Partial<Omit<Coupon, 'id'>>
      }
      newsletter_subscribers: {
        Row: NewsletterSubscriber
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at'>
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>
      }
      inventory_log: {
        Row: InventoryLog
        Insert: Omit<InventoryLog, 'id' | 'created_at'>
        Update: Partial<Omit<InventoryLog, 'id'>>
      }
    }
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number | null
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  category_id: string | null
  subcategory_id: string | null
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  stock: number
  is_active: boolean
  is_featured: boolean
  tags: string[]
  gender: 'hombre' | 'mujer' | 'unisex' | 'nino' | 'nina' | null
  age_group: 'adulto' | 'nino' | 'bebe' | null
  material: string | null
  brand: string | null
  sku: string
  weight: number | null
  created_at: string
  updated_at: string
  // Joined
  category?: Category
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Order {
  id: string
  user_id: string | null
  status: 'pendiente' | 'confirmado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado'
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  payment_method: string | null
  payment_status: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'
  payment_reference: string | null
  shipping_address: ShippingAddress
  items: OrderItem[]
  notes: string | null
  tracking_number: string | null
  coupon_code: string | null
  discount_amount: number
  created_at: string
  updated_at: string
  whatsapp_sent: boolean
  whatsapp_sent_at: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
}

export interface ShippingAddress {
  full_name?: string
  address?: string
  city?: string
  department?: string
  postal_code?: string
  phone?: string
  notes?: string
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  size: string | null
  color: string | null
  created_at: string
  updated_at: string
  // Joined
  product?: Product
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  default_address: ShippingAddress | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  comment: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number | null
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

export interface InventoryLog {
  id: string
  product_id: string
  change_amount: number
  reason: string | null
  created_by: string | null
  created_at: string
}

// Cart store types (client-side with Zustand)
export interface LocalCartItem {
  product_id: string
  product: Product
  quantity: number
  size: string | null
  color: string | null
}

export interface CheckoutData {
  customer_name: string
  customer_phone: string
  customer_email: string
  shipping_address: ShippingAddress
  notes: string
}
