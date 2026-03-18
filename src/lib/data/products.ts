'use server'

import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

export interface ListProductsParams {
  page?: number
  limit?: number
  category_id?: string
  subcategory_id?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc'
  search?: string
  gender?: string
  is_featured?: boolean
  tags?: string[]
}

export interface ListProductsResult {
  products: Product[]
  count: number
}

export async function listProducts(
  params: ListProductsParams = {}
): Promise<ListProductsResult> {
  const {
    page = 1,
    limit = 12,
    category_id,
    subcategory_id,
    sortBy = 'newest',
    search,
    gender,
    is_featured,
    tags,
  } = params

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)', { count: 'exact' })
    .eq('is_active', true)

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  if (subcategory_id) {
    query = query.eq('subcategory_id', subcategory_id)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (gender) {
    query = query.eq('gender', gender)
  }

  if (is_featured !== undefined) {
    query = query.eq('is_featured', is_featured)
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  switch (sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'name_asc':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`)
  }

  return {
    products: (data as Product[]) ?? [],
    count: count ?? 0,
  }
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching product: ${error.message}`)
  }

  return data as Product
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching product: ${error.message}`)
  }

  return data as Product
}

export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Error fetching featured products: ${error.message}`)
  }

  return (data as Product[]) ?? []
}

export async function searchProducts(
  query: string,
  limit: number = 20
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Error searching products: ${error.message}`)
  }

  return (data as Product[]) ?? []
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit: number = 4
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(*)')
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching related products: ${error.message}`)
  }

  return (data as Product[]) ?? []
}
