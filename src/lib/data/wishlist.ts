'use server'

import { supabase } from '@/lib/supabase'
import type { WishlistItem, Product } from '@/types/database'

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product
}

export async function getWishlist(
  userId: string
): Promise<WishlistItemWithProduct[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, product:products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching wishlist: ${error.message}`)
  }

  return (data as WishlistItemWithProduct[]) ?? []
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem> {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    return existing as WishlistItem
  }

  const { data, error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single()

  if (error) {
    throw new Error(`Error adding to wishlist: ${error.message}`)
  }

  return data
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    throw new Error(`Error removing from wishlist: ${error.message}`)
  }
}

export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking wishlist: ${error.message}`)
  }

  return !!data
}
