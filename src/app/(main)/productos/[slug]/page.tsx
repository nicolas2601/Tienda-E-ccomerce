'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/database'

const formatCOP = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export default function ProductoDetallePage() {
  const params = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories!products_category_id_fkey(*)')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      setProduct(data as Product | null)
      setLoading(false)
    }
    fetchProduct()
  }, [params.slug])

  if (loading) {
    return (
      <main className="container py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-6">
          El producto que buscas no existe o ya no esta disponible.
        </p>
        <Link
          href="/productos"
          className="inline-block border-2 border-black px-6 py-3 font-bold uppercase hover:bg-black hover:text-white transition-colors"
        >
          Ver productos
        </Link>
      </main>
    )
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(
          ((product.compare_at_price - product.price) /
            product.compare_at_price) *
            100
        )
      : 0

  return (
    <main className="container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/productos" className="hover:underline">
              Productos
            </Link>
          </li>
          {product.category && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/categorias/${product.category.slug}`}
                  className="hover:underline"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-800">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border">
            {product.images?.[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={`${product.name} - imagen ${selectedImage + 1}`}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                -{discount}%
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                    idx === selectedImage
                      ? 'border-black'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-sm text-gray-500 uppercase hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mt-1">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-bold">
              {formatCOP(product.price)}
            </span>
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCOP(product.compare_at_price)}
                </span>
              )}
          </div>

          {product.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-sm uppercase mb-2">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-sm uppercase mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium transition-colors ${
                      selectedColor === color.name
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-bold text-sm uppercase mb-2">Cantidad</h3>
            <div className="flex items-center border rounded w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg hover:bg-gray-100"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="px-4 py-2 text-center min-w-[3rem]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg hover:bg-gray-100"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`mt-8 w-full py-4 font-bold uppercase text-lg rounded transition-colors duration-300 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          </button>

          {/* Shipping info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm text-gray-600">
            <p>Envios a toda Colombia</p>
            <p>Productos importados directamente de Canada</p>
            <p>Pago contra entrega disponible en ciudades principales</p>
          </div>
        </div>
      </div>
    </main>
  )
}
