'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  description: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
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

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { is_active: true, sort_order: 0 },
  })

  const nameValue = watch('name')
  if (nameValue) {
    const slug = slugify(nameValue)
    const currentSlug = watch('slug')
    if (currentSlug !== slug) setValue('slug', slug)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.from('categories').insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: imageUrl[0] || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      })
      if (error) throw error
      toast.success('Categoria creada exitosamente')
      router.push('/admin/categorias')
    } catch (err: any) {
      toast.error(err.message ?? 'Error creando categoria')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500'
  const labelCls = 'mb-1 block text-sm font-medium text-gray-700'
  const errorCls = 'mt-1 text-xs text-red-600'

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categorias" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Categorias
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva categoria</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-6 rounded-xl border border-pink-100 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input {...register('name')} className={inputCls} />
            {errors.name && <p className={errorCls}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input {...register('slug')} className={inputCls} />
            {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Descripcion</label>
          <textarea {...register('description')} rows={3} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Imagen de la categoria</label>
          <ImageUpload images={imageUrl} onChange={setImageUrl} multiple={false} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Orden</label>
            <input type="number" {...register('sort_order')} className={inputCls} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              Activa
            </label>
          </div>
        </div>

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
            {submitting ? 'Guardando...' : 'Crear categoria'}
          </button>
        </div>
      </form>
    </div>
  )
}
