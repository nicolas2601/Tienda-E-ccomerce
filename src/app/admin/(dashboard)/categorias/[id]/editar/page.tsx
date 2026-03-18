'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/admin/ImageUpload'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  description: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().nullable().optional(),
  is_active: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categoryImage, setCategoryImage] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const nameValue = watch('name')

  useEffect(() => {
    const loadCategory = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (error || !data) {
        toast.error('Error cargando categoria')
        router.push('/admin/categorias')
        return
      }

      reset({
        name: data.name,
        slug: data.slug,
        description: data.description ?? '',
        sort_order: data.sort_order,
        is_active: data.is_active,
      })

      if (data.image_url) {
        setCategoryImage([data.image_url])
      }

      setLoading(false)
    }

    loadCategory()
  }, [categoryId, reset, router])

  const onSubmit = async (data: CategoryFormValues) => {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          image_url: categoryImage[0] || null,
          sort_order: data.sort_order ?? null,
          is_active: data.is_active,
        })
        .eq('id', categoryId)

      if (error) throw error

      toast.success('Categoria actualizada exitosamente')
      router.push('/admin/categorias')
    } catch (err: any) {
      toast.error(err.message ?? 'Error actualizando categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNameChange = () => {
    if (nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500'
  const labelCls = 'mb-1 block text-sm font-medium text-gray-700'
  const errorCls = 'mt-1 text-xs text-red-600'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">Cargando categoria...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/categorias"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Categorias
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar categoria</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-6 rounded-xl border border-pink-100 bg-white p-6 shadow-sm"
      >
        {/* Nombre y Slug */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input
              {...register('name')}
              onBlur={handleNameChange}
              className={inputCls}
            />
            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input {...register('slug')} className={inputCls} />
            {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
          </div>
        </div>

        {/* Descripcion */}
        <div>
          <label className={labelCls}>Descripcion</label>
          <textarea
            {...register('description')}
            rows={3}
            className={inputCls}
          />
        </div>

        {/* Imagen */}
        <div>
          <label className={labelCls}>Imagen de la categoria</label>
          <ImageUpload
            images={categoryImage}
            onChange={setCategoryImage}
            multiple={false}
          />
        </div>

        {/* Orden y Activa */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Orden de visualizacion</label>
            <input
              type="number"
              {...register('sort_order')}
              className={inputCls}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              Categoria activa
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Link
            href="/admin/categorias"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-pink-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
