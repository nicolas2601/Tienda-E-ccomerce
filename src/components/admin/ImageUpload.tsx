'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  images: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
}

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export default function ImageUpload({
  images,
  onChange,
  multiple = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      const invalid = fileArray.filter(
        (f) => !f.type.startsWith('image/')
      )
      if (invalid.length > 0) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }

      const tooLarge = fileArray.filter((f) => f.size > 5 * 1024 * 1024)
      if (tooLarge.length > 0) {
        toast.error('Las imagenes deben ser menores a 5MB')
        return
      }

      setUploading(true)
      try {
        const uploadPromises = fileArray.map((file) => uploadImage(file))
        const newUrls = await Promise.all(uploadPromises)

        if (multiple) {
          onChange([...images, ...newUrls])
        } else {
          onChange([newUrls[0]])
        }

        toast.success(
          newUrls.length === 1
            ? 'Imagen subida exitosamente'
            : `${newUrls.length} imagenes subidas exitosamente`
        )
      } catch (err: any) {
        toast.error(err.message ?? 'Error subiendo imagen')
      } finally {
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [images, onChange, multiple]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
          dragOver
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <svg
          className="mb-2 h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {uploading ? (
          <p className="text-sm text-gray-500">Subiendo...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">
              Arrastra imagenes aqui o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, WebP hasta 5MB
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
              {/* Overlay with actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {multiple && index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="rounded-full bg-white/90 p-1.5 text-gray-700 hover:bg-white"
                    title="Mover a la izquierda"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600"
                  title="Eliminar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {multiple && index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="rounded-full bg-white/90 p-1.5 text-gray-700 hover:bg-white"
                    title="Mover a la derecha"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Index badge */}
              {multiple && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
