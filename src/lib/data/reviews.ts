'use server'

import { supabase } from '@/lib/supabase'
import type { Review, Database } from '@/types/database'

type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

export interface ListReviewsParams {
  product_id: string
  page?: number
  limit?: number
  approved_only?: boolean
}

export interface ListReviewsResult {
  reviews: Review[]
  count: number
}

export async function listReviews(
  params: ListReviewsParams
): Promise<ListReviewsResult> {
  const { product_id, page = 1, limit = 10, approved_only = true } = params
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('product_id', product_id)

  if (approved_only) {
    query = query.eq('is_approved', true)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching reviews: ${error.message}`)
  }

  return {
    reviews: data ?? [],
    count: count ?? 0,
  }
}

export async function createReview(
  data: ReviewInsert
): Promise<Review> {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating review: ${error.message}`)
  }

  return review
}

export async function getProductRating(
  productId: string
): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)

  if (error) {
    throw new Error(`Error fetching product rating: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { average: 0, count: 0 }
  }

  const total = data.reduce((sum, r) => sum + r.rating, 0)

  return {
    average: Math.round((total / data.length) * 10) / 10,
    count: data.length,
  }
}

export async function getUserReviewForProduct(
  userId: string,
  productId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching user review: ${error.message}`)
  }

  return data
}
