'use server'

import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Error fetching categories: ${error.message}`)
  }

  return data ?? []
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching category: ${error.message}`)
  }

  return data
}

export async function getCategoryById(
  id: string
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Error fetching category: ${error.message}`)
  }

  return data
}

export async function listSubcategories(
  parentId: string
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Error fetching subcategories: ${error.message}`)
  }

  return data ?? []
}
