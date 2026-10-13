import { useState, useRef } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useSupabase'
import { getProductImages, type Product } from '../types'

interface PhotoQueueItem {
  id: string
  file: File
  previewUrl: string
  cleanFilename: string
  matchedProduct: Product | null
  targetSlot: 0 | 1 | 2 // 0 = Slot 1 (Principal), 1 = Slot 2, 2 = Slot 3
  isAutoMatched: boolean
  status: 'pending' | 'uploading' | 'success' | 'error'
  errorMessage?: string
}

// Client-side lightweight image optimization to WebP
async function compressImageToWebP(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    // If SVG or gif, return as is
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file)
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const maxDimension = 1200
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            resolve(blob || file)
          },
          'image/webp',
          0.85
        )
      } else {
        resolve(file)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }
  })
}

// Normalizer for fuzzy matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
}

export default function BulkPhotosAdmin({ onDone }: { onDone?: () => void }) {
  const { products, refetch } = useProducts()
  const [queue, setQueue] = useState<PhotoQueueItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [completed, setCompleted] = useState(false)
  const [uploadStats, setUploadStats] = useState({ uploaded: 0, updatedProducts: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Smart matching logic
  const matchProductFromFilename = (
    filename: string
  ): { product: Product | null; slot: 0 | 1 | 2; isAuto: boolean } => {
    // Remove extension
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename

    // Detect slot number at the end (e.g., "Pusheen Donut 2", "Pusheen Donut - 3", "Pusheen Donut (1)")
    let detectedSlot: 0 | 1 | 2 = 0
    let cleanBaseName = nameWithoutExt

    const slotMatch = nameWithoutExt.match(/(?:[-_\s]+|\()([1-3])\)?$/)
    if (slotMatch) {
      const num = parseInt(slotMatch[1], 10)
      if (num === 1) detectedSlot = 0
      else if (num === 2) detectedSlot = 1
      else if (num === 3) detectedSlot = 2
      cleanBaseName = nameWithoutExt.replace(/(?:[-_\s]+|\()([1-3])\)?$/, '').trim()
    }

    const normTarget = normalizeText(cleanBaseName)
    if (!normTarget) return { product: null, slot: 0, isAuto: false }

    const targetWords = normTarget.split(/\s+/).filter(Boolean)

    let bestMatch: Product | null = null
    let highestScore = 0

    for (const p of products) {
      const normEs = normalizeText(p.title_es)
      const normEn = normalizeText(p.title_en || '')

      // 1. Exact match
      if (normEs === normTarget || normEn === normTarget) {
        return { product: p, slot: detectedSlot, isAuto: true }
      }

      // 2. Starts with or includes match
      if (normEs.startsWith(normTarget) || normTarget.startsWith(normEs)) {
        return { product: p, slot: detectedSlot, isAuto: true }
      }

      // 3. Word overlap match
      const pWords = normEs.split(/\s+/).filter(Boolean)
      const matchingWords = targetWords.filter((w) => pWords.includes(w))
      const score = matchingWords.length / Math.max(targetWords.length, pWords.length)

      if (score > highestScore && score >= 0.5) {
        highestScore = score
        bestMatch = p
      }
    }

    return {
      product: bestMatch,
      slot: detectedSlot,
      isAuto: bestMatch !== null,
    }
  }

  // Handle selected files
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: PhotoQueueItem[] = []

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return

      const { product, slot, isAuto } = matchProductFromFilename(file.name)
      const previewUrl = URL.createObjectURL(file)

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl,
        cleanFilename: file.name,
        matchedProduct: product,
        targetSlot: slot,
        isAutoMatched: isAuto,
        status: 'pending',
      })
    })

    setQueue((prev) => [...prev, ...newItems])
    setCompleted(false)
  }

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  const handleClearAll = () => {
    queue.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    setQueue([])
    setCompleted(false)
  }

  const handleUpdateProductAssignment = (itemId: string, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId) || null
    setQueue((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, matchedProduct: selectedProd, isAutoMatched: false }
          : item
      )
    )
  }

  const handleUpdateSlot = (itemId: string, slot: 0 | 1 | 2) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, targetSlot: slot } : item))
    )
  }

  // Execute bulk upload & assign
  const handleStartUpload = async () => {
    const assignableItems = queue.filter((i) => i.matchedProduct !== null)
    if (assignableItems.length === 0) {
      alert('Asigna al menos una foto a un producto antes de comenzar la subida.')
      return
    }

    setUploading(true)
    setProgress({ current: 0, total: assignableItems.length })

    let uploadedCount = 0
    const touchedProductIds = new Set<string>()

    // Group items by product to update their slots cleanly
    const productUpdatesMap = new Map<
      string,
      { product: Product; newSlots: (string | null)[] }
    >()

    for (let i = 0; i < assignableItems.length; i++) {
      const item = assignableItems[i]
      setProgress({ current: i + 1, total: assignableItems.length })

      const prod = item.matchedProduct!

      try {
        // Compress image to WebP
        const compressedBlob = await compressImageToWebP(item.file)

        // Upload to Supabase Storage
        const ext = 'webp'
        const path = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, compressedBlob, { contentType: 'image/webp' })

        if (uploadError) {
          console.error('Error subiendo imagen:', item.file.name, uploadError)
          setQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: 'error', errorMessage: uploadError.message }
                : it
            )
          )
          continue
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)
        const publicUrl = publicUrlData.publicUrl

        // Register to product update map
        if (!productUpdatesMap.has(prod.id)) {
          const currentImgs = getProductImages(prod)
          productUpdatesMap.set(prod.id, {
            product: prod,
            newSlots: [currentImgs[0] || null, currentImgs[1] || null, currentImgs[2] || null],
          })
        }

        const updateData = productUpdatesMap.get(prod.id)!
        updateData.newSlots[item.targetSlot] = publicUrl

        uploadedCount++
        touchedProductIds.add(prod.id)

        setQueue((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'success' } : it))
        )
      } catch (err) {
        console.error('Error procesando item:', item.file.name, err)
      }
    }

    // Now commit all updated image URLs to Supabase products table
    for (const [prodId, data] of productUpdatesMap.entries()) {
      const finalImages = data.newSlots.filter(Boolean) as string[]
      const joinedUrl = finalImages.join(',')

      await supabase
        .from('products')
        .update({ image_url: joinedUrl })
        .eq('id', prodId)
    }

    setUploadStats({
      uploaded: uploadedCount,
      updatedProducts: touchedProductIds.size,
    })

    await refetch()
    setUploading(false)
    setCompleted(true)
  }

  const totalAssigned = queue.filter((i) => i.matchedProduct !== null).length
  const totalUnassigned = queue.filter((i) => i.matchedProduct === null).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100 dark:border-purple-800/30">
        <div>
          <div className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-pink-500" />
            <h2 className="font-['Quicksand'] font-extrabold text-xl text-gray-800 dark:text-gray-100">
              Subida Masiva de Fotos por Lote
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-['Nunito'] mt-0.5">
            Arrastra decenas de fotos a la vez y el sistema las asociará automáticamente por nombre de archivo.
          </p>
        </div>

        {queue.length > 0 && !uploading && !completed && (
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3.5 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 text-xs font-bold font-['Nunito'] transition-all self-start sm:self-auto"
          >
            Limpiar lista
          </button>
        )}
      </div>

      {/* How it works info card */}
      <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-purple-950/20 border border-pink-100 dark:border-purple-800/40 flex items-start gap-3 text-xs font-['Nunito'] text-gray-600 dark:text-gray-300">
        <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-800 dark:text-gray-100 block mb-0.5">
            💡 ¿Cómo nombrar tus fotos para vincularlas automáticamente?
          </strong>
          Nombra tus fotos con el nombre del producto y el número de foto al final. Por ejemplo:
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="bg-white dark:bg-[#1F1B24] px-2 py-0.5 rounded border border-pink-200 dark:border-purple-800 text-pink-600 dark:text-pink-300">
              Peluche Pusheen 1.jpg (Foto principal)
            </span>
            <span className="bg-white dark:bg-[#1F1B24] px-2 py-0.5 rounded border border-pink-200 dark:border-purple-800 text-pink-600 dark:text-pink-300">
              Peluche Pusheen 2.jpg (Segunda foto)
            </span>
            <span className="bg-white dark:bg-[#1F1B24] px-2 py-0.5 rounded border border-pink-200 dark:border-purple-800 text-pink-600 dark:text-pink-300">
              Taza Gatito.png
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            *Las fotos se comprimen y convierten automáticamente a WebP para que suban al instante sin perder calidad.
          </span>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-pink-300 dark:border-purple-700/50 hover:bg-pink-50/40 dark:hover:bg-purple-900/10 cursor-pointer transition-all flex flex-col items-center justify-center text-center group bg-white/40 dark:bg-[#1F1B24]/40"
      >
        <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-purple-900/40 text-pink-500 dark:text-pink-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="font-['Quicksand'] font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 mb-1">
          Arrastra aquí tus fotos o haz clic para explorar
        </h3>
        <p className="text-xs text-gray-400 font-['Nunito'] max-w-sm">
          Puedes soltar 10, 20 o más fotos simultáneamente (.JPG, .PNG, .WEBP)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFilesAdded(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Photos Queue Preview */}
      {queue.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary counters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1F1B24] border border-pink-100 dark:border-purple-800/30 shadow-sm text-xs font-['Nunito']">
            <div className="flex items-center gap-4">
              <span>
                Total fotos seleccionadas: <strong>{queue.length}</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {totalAssigned} vinculadas a producto
              </span>
              {totalUnassigned > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {totalUnassigned} pendientes de asignar
                </span>
              )}
            </div>

            {!completed && !uploading && (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={totalAssigned === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition-all font-['Nunito'] text-xs disabled:opacity-50"
              >
                Subir y Asignar {totalAssigned} fotos ahora
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-800 shadow-sm space-y-2 text-center">
              <div className="flex items-center justify-between text-xs font-bold font-['Nunito'] text-gray-700 dark:text-gray-200">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
                  Optimizando y subiendo fotos a Supabase...
                </span>
                <span>
                  {progress.current} de {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed Banner */}
          {completed && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-['Quicksand'] font-bold text-sm text-emerald-800 dark:text-emerald-200">
                    ¡Subida masiva completada!
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-['Nunito']">
                    Se subieron {uploadStats.uploaded} fotos y se actualizaron {uploadStats.updatedProducts} productos en tu tienda.
                  </p>
                </div>
              </div>

              {onDone && (
                <button
                  type="button"
                  onClick={onDone}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs font-['Nunito'] shadow-sm transition-all"
                >
                  Ver Catálogo
                </button>
              )}
            </div>
          )}

          {/* Queue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  item.status === 'success'
                    ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : item.matchedProduct
                    ? 'border-pink-200/80 dark:border-purple-800/30 bg-white dark:bg-[#1F1B24]'
                    : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-950/10'
                }`}
              >
                {/* Photo thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={item.previewUrl}
                    alt={item.cleanFilename}
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'success' && (
                    <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-[1px] flex items-center justify-center text-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Details & Selectors */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                      {item.cleanFilename}
                    </p>
                    {item.isAutoMatched && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                        <Sparkles className="w-2.5 h-2.5" /> Auto
                      </span>
                    )}
                  </div>

                  {/* Product assignment dropdown */}
                  <div>
                    <select
                      value={item.matchedProduct?.id || ''}
                      onChange={(e) => handleUpdateProductAssignment(item.id, e.target.value)}
                      disabled={uploading || item.status === 'success'}
                      className="w-full px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-[#251f2d] border border-gray-200 dark:border-gray-700 text-xs font-['Nunito'] text-gray-800 dark:text-gray-200 outline-none"
                    >
                      <option value="">⚠️ Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_es} (${p.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slot selector (Foto 1, 2, 3) */}
                  {item.matchedProduct && (
                    <div className="flex items-center gap-1.5 text-[11px] font-['Nunito'] text-gray-500">
                      <span>Asignar como:</span>
                      <select
                        value={item.targetSlot}
                        onChange={(e) =>
                          handleUpdateSlot(item.id, parseInt(e.target.value, 10) as 0 | 1 | 2)
                        }
                        disabled={uploading || item.status === 'success'}
                        className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700 outline-none"
                      >
                        <option value={0}>Foto 1 (Principal)</option>
                        <option value={1}>Foto 2</option>
                        <option value={2}>Foto 3</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Remove item button */}
                {!uploading && item.status !== 'success' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Quitar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
