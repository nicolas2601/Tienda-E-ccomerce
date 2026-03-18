'use server'

import { supabase } from '@/lib/supabase'
import type { Order, Database } from '@/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export interface ListOrdersParams {
  user_id?: string
  status?: Order['status']
  payment_status?: Order['payment_status']
  page?: number
  limit?: number
}

export interface ListOrdersResult {
  orders: Order[]
  count: number
}

export async function createOrder(
  data: OrderInsert
): Promise<Order> {
  const { data: order, error } = await supabase
    .from('orders')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating order: ${error.message}`)
  }

  return order
}

export async function getOrderById(
  id: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching order: ${error.message}`)
  }

  return data
}

export async function listOrders(
  params: ListOrdersParams = {}
): Promise<ListOrdersResult> {
  const { user_id, status, payment_status, page = 1, limit = 10 } = params
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })

  if (user_id) {
    query = query.eq('user_id', user_id)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (payment_status) {
    query = query.eq('payment_status', payment_status)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching orders: ${error.message}`)
  }

  return {
    orders: data ?? [],
    count: count ?? 0,
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating order status: ${error.message}`)
  }

  return data
}

export async function updateOrder(
  id: string,
  updates: OrderUpdate
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating order: ${error.message}`)
  }

  return data
}
