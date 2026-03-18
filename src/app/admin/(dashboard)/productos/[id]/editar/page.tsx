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
import type { Category } from '@/types/database'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  description: z.string().min(1, 'La descripcion es obligatoria'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  compare_at_price: z.coerce.number().nullable().optional(),
  category_id: z.string().nullable().optional(),
  sizes: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  gender: z.enum(['hombre', 'mujer', 'unisex', 'nino', 'nina']).nullable().optional(),
  age_group: z.enum(['adulto', 'nino', 'bebe']).nullable().optional(),
  material: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  tags: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([])
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#000000')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    const loadData = async () => {
      const [productRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase.from('categories').select('*').eq('is_active', true).order('name'),
      ])

      if (productRes.error) {
        toast.error('Error cargando producto')
        router.push('/admin/productos')
        return
      }

      if (categoriesRes.data) setCategories(categoriesRes.data)

      const p = productRes.data
      reset({
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compare_at_price: p.compare_at_price,
        category_id: p.category_id || '',
        sizes: p.sizes?.join(', ') ?? '',
        stock: p.stock,
        is_active: p.is_active,
        is_featured: p.is_featured,
        gender: p.gender,
        age_group: p.age_group,
        material: p.material,
        brand: p.brand,
        sku: p.sku,
        tags: p.tags?.join(', ') ?? '',
      })

      setProductImages(p.images ?? [])
      setColors(p.colors ?? [])
      setLoading(false)
    }

    loadData()
  }, [productId, reset, router])

  const addColor = () => {
    if (!colorName.trim()) return
    setColors((prev) => [...prev, { name: colorName.trim(), hex: colorHex }])
    setColorName('')
    setColorHex('#000000')
  }

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true)
    try {
      const sizesArray = data.sizes
        ? data.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      const tagsArray = data.tags
        ? data.tags.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          compare_at_price: data.compare_at_price || null,
          category_id: data.category_id || null,
          sizes: sizesArray,
          colors: colors,
          stock: data.stock,
          is_active: data.is_active,
          is_featured: data.is_featured,
          gender: data.gender || null,
          age_group: data.age_group || null,
          material: data.material || null,
          brand: data.brand || null,
          sku: data.sku,
          images: productImages,
          tags: tagsArray,
        })
        .eq('id', productId)

      if (error) throw error

      toast.success('Producto actualizado exitosamente')
      router.push('/admin/productos')
    } catch (err: any) {
      toast.error(err.message ?? 'Error actualizando producto')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500'
  const labelCls = 'mb-1 block text-sm font-medium text-gray-700'
  const errorCls = 'mt-1 text-xs text-red-600'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-500">Cargando producto...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Productos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-6 rounded-xl border border-pink-100 bg-white p-6 shadow-sm"
      >
        {/* Nombre y Slug */}
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

        {/* Descripcion */}
        <div>
          <label className={labelCls}>Descripcion *</label>
          <textarea
            {...register('description')}
            rows={4}
            className={inputCls}
          />
          {errors.description && (
            <p className={errorCls}>{errors.description.message}</p>
          )}
        </div>

        {/* Precio, Precio comparativo, Stock */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Precio (COP) *</label>
            <input
              type="number"
              {...register('price')}
              className={inputCls}
            />
            {errors.price && <p className={errorCls}>{errors.price.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Precio anterior (COP)</label>
            <input
              type="number"
              {...register('compare_at_price')}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Stock *</label>
            <input
              type="number"
              {...register('stock')}
              className={inputCls}
            />
            {errors.stock && <p className={errorCls}>{errors.stock.message}</p>}
          </div>
        </div>

        {/* Categoria, SKU, Marca */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Categoria</label>
            <select {...register('category_id')} className={inputCls}>
              <option value="">Sin categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>SKU *</label>
            <input {...register('sku')} className={inputCls} />
            {errors.sku && <p className={errorCls}>{errors.sku.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Marca</label>
            <input {...register('brand')} className={inputCls} />
          </div>
        </div>

        {/* Genero, Grupo de edad, Material */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Genero</label>
            <select {...register('gender')} className={inputCls}>
              <option value="">Seleccionar</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="unisex">Unisex</option>
              <option value="nino">Nino</option>
              <option value="nina">Nina</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Grupo de edad</label>
            <select {...register('age_group')} className={inputCls}>
              <option value="">Seleccionar</option>
              <option value="adulto">Adulto</option>
              <option value="nino">Nino</option>
              <option value="bebe">Bebe</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Material</label>
            <input {...register('material')} className={inputCls} />
          </div>
        </div>

        {/* Tallas */}
        <div>
          <label className={labelCls}>Tallas (separadas por coma)</label>
          <input
            {...register('sizes')}
            placeholder="S, M, L, XL"
            className={inputCls}
          />
        </div>

        {/* Colores */}
        <div>
          <label className={labelCls}>Colores</label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nombre del color"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-[38px] w-16 cursor-pointer rounded-lg border border-gray-300"
              />
            </div>
            <button
              type="button"
              onClick={addColor}
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Agregar
            </button>
          </div>
          {colors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Imagenes */}
        <div>
          <label className={labelCls}>Imagenes del producto</label>
          <ImageUpload images={productImages} onChange={setProductImages} />
        </div>

        {/* Tags */}
        <div>
          <label className={labelCls}>Etiquetas (separadas por coma)</label>
          <input
            {...register('tags')}
            placeholder="oferta, nuevo, tendencia"
            className={inputCls}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('is_featured')}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            Destacado
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Link
            href="/admin/productos"
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
