import { useState, useRef } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useProducts, useCategories } from '../hooks/useSupabase'
import type { Category, Product } from '../types'

type DuplicateStrategy = 'update' | 'skip' | 'duplicate'

interface ParsedProductRow {
  rawName: string
  name: string
  categoryName: string
  categoryId: string | null
  price: number
  description: string
  image: string
  badge: string | null
  inStock: boolean
  isExisting: boolean
  existingProduct?: Product
  hasError: boolean
  errorMessage?: string
}

export default function BulkImportAdmin({
  onDone,
  onGoToPhotos,
}: {
  onDone?: () => void
  onGoToPhotos?: () => void
}) {
  const { products, refetch: refetchProducts } = useProducts()
  const { categories, refetch: refetchCategories } = useCategories()

  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'completed'>('input')
  const [inputText, setInputText] = useState('')
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('update')
  const [autoCreateCategories, setAutoCreateCategories] = useState(true)
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [importResults, setImportResults] = useState<{ created: number; updated: number; skipped: number; errors: number }>({
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      'nombre,categoria,precio,descripcion,imagen,badge\n' +
      'Peluche Pusheen Donut,Peluches y Coleccionables,350.00,Peluche suave tematica de dona,,new\n' +
      'Taza Gatito Pastel,Hogar Cocina y Decoracion,180.00,Taza de ceramica 350ml,,exclusive\n' +
      'Libreta Pusheen Sirena,Papeleria y Oficina,120.00,Libreta pasta dura hojas rayadas,,\n' +
      'Llavero Pusheenicorn,Moda y Accesorios,85.00,Llavero acrilico coleccionable,,\n' +
      'Balsamo Labial Fresa,Belleza y Cuidado Personal,95.00,Balsamo hidratante con aroma,,last'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'plantilla_productos_magic_alexa.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setInputText(content)
      }
    }
    reader.readAsText(file)
  }

  // Parse lines (supports CSV with commas or semicolons, and TSV tabs from Excel copy-paste)
  const parseRowsFromText = (text: string): ParsedProductRow[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) return []

    // Detect separator: Tab, Semicolon, or Comma
    const firstLine = lines[0]
    let separator = ','
    if (firstLine.includes('\t')) {
      separator = '\t'
    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
      separator = ';'
    }

    // Split row taking care of quotes
    const splitLine = (line: string): string[] => {
      if (separator === '\t') {
        return line.split('\t').map((c) => c.replace(/^["']|["']$/g, '').trim())
      }
      // Simple regex for CSV respecting quotes
      const regex = new RegExp(`(?:^|${separator})(?:"([^"]*)"|([^${separator}]*))`, 'g')
      const matches: string[] = []
      let match
      while ((match = regex.exec(line)) !== null) {
        let val = match[1] !== undefined ? match[1] : match[2]
        val = (val || '').trim()
        matches.push(val)
      }
      return matches
    }

    // Detect header or data
    let startIndex = 0
    const rawHeaders = splitLine(firstLine).map((h) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    const hasHeader = rawHeaders.some((h) =>
      ['nombre', 'name', 'titulo', 'title', 'articulo', 'producto', 'precio', 'price', 'categoria', 'category'].includes(h)
    )

    const headerMap = {
      name: -1,
      category: -1,
      price: -1,
      description: -1,
      image: -1,
      badge: -1,
      stock: -1,
    }

    if (hasHeader) {
      startIndex = 1
      rawHeaders.forEach((h, idx) => {
        if (h.includes('nom') || h.includes('tit') || h.includes('prod') || h.includes('art') || h.includes('name')) headerMap.name = idx
        else if (h.includes('cat')) headerMap.category = idx
        else if (h.includes('prec') || h.includes('cost') || h.includes('price')) headerMap.price = idx
        else if (h.includes('desc')) headerMap.description = idx
        else if (h.includes('imag') || h.includes('fot') || h.includes('pic')) headerMap.image = idx
        else if (h.includes('badg') || h.includes('etiq')) headerMap.badge = idx
        else if (h.includes('stock')) headerMap.stock = idx
      })
    } else {
      // Default positions: 0: name, 1: category, 2: price, 3: description, 4: image
      headerMap.name = 0
      headerMap.category = 1
      headerMap.price = 2
      headerMap.description = 3
      headerMap.image = 4
    }

    // Helper to normalize strings for comparison
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

    // Map existing products by normalized title
    const existingMap = new Map<string, Product>()
    products.forEach((p) => {
      existingMap.set(norm(p.title_es), p)
      if (p.title_en) existingMap.set(norm(p.title_en), p)
    })

    // Map existing categories by name and slug
    const categoryMap = new Map<string, Category>()
    categories.forEach((c) => {
      categoryMap.set(norm(c.name_es), c)
      if (c.name_en) categoryMap.set(norm(c.name_en), c)
      categoryMap.set(c.slug, c)
    })

    const result: ParsedProductRow[] = []

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      const cols = splitLine(line)
      if (cols.length === 0 || cols.every((c) => c === '')) continue

      const rawName = headerMap.name !== -1 && cols[headerMap.name] ? cols[headerMap.name] : cols[0] || ''
      const rawCategory = headerMap.category !== -1 && cols[headerMap.category] ? cols[headerMap.category] : cols[1] || ''
      const rawPrice = headerMap.price !== -1 && cols[headerMap.price] ? cols[headerMap.price] : cols[2] || '0'
      const rawDesc = headerMap.description !== -1 && cols[headerMap.description] ? cols[headerMap.description] : cols[3] || ''
      const rawImage = headerMap.image !== -1 && cols[headerMap.image] ? cols[headerMap.image] : cols[4] || ''
      const rawBadge = headerMap.badge !== -1 && cols[headerMap.badge] ? cols[headerMap.badge] : null

      const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.-]/g, '')) || 0
      const existingProduct = existingMap.get(norm(rawName))
      const matchedCategory = categoryMap.get(norm(rawCategory))

      let hasError = false
      let errorMessage = ''

      if (!rawName.trim()) {
        hasError = true
        errorMessage = 'Nombre del producto vacío'
      } else if (isNaN(cleanPrice) || cleanPrice < 0) {
        hasError = true
        errorMessage = 'Precio inválido'
      }

      result.push({
        rawName,
        name: rawName.trim(),
        categoryName: rawCategory.trim(),
        categoryId: matchedCategory ? matchedCategory.id : null,
        price: cleanPrice,
        description: rawDesc.trim(),
        image: rawImage.trim(),
        badge: rawBadge ? rawBadge.trim() : null,
        inStock: true,
        isExisting: !!existingProduct,
        existingProduct,
        hasError,
        errorMessage,
      })
    }

    return result
  }

  const handleProcessPreview = () => {
    if (!inputText.trim()) {
      alert('Por favor pega texto o sube un archivo CSV primero.')
      return
    }
    const rows = parseRowsFromText(inputText)
    if (rows.length === 0) {
      alert('No se encontraron productos válidos para procesar.')
      return
    }
    setParsedRows(rows)
    setStep('preview')
  }

  // Execute bulk import with selected duplicate strategy
  const handleExecuteImport = async () => {
    setStep('importing')
    setProgress({ current: 0, total: parsedRows.length })

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Cache of categories to avoid repeated inserts
    const currentCats = [...categories]
    const getOrGenerateCategoryId = async (catName: string): Promise<string | null> => {
      if (!catName) return null
      const normName = catName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
      const existing = currentCats.find(
        (c) =>
          c.name_es.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === normName ||
          c.slug === normName
      )
      if (existing) return existing.id

      if (!autoCreateCategories) return null

      // Auto-create category in database
      const slug = normName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name_es: catName,
          name_en: catName,
          slug: slug || `cat-${Date.now()}`,
        })
        .select()
        .single()

      if (!error && data) {
        currentCats.push(data)
        return data.id
      }
      return null
    }

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i]
      setProgress({ current: i + 1, total: parsedRows.length })

      if (row.hasError) {
        errorCount++
        continue
      }

      // Check if product exists
      if (row.isExisting && row.existingProduct) {
        if (duplicateStrategy === 'skip') {
          skippedCount++
          continue
        }

        if (duplicateStrategy === 'update') {
          // Update existing product
          let catId = row.categoryId
          if (!catId && row.categoryName) {
            catId = await getOrGenerateCategoryId(row.categoryName)
          }

          // Preserve existing images if none provided in bulk import
          const finalImage = row.image || row.existingProduct.image_url

          const { error } = await supabase
            .from('products')
            .update({
              price: row.price,
              category_id: catId || row.existingProduct.category_id,
              description_es: row.description || row.existingProduct.description_es,
              image_url: finalImage,
              badge: row.badge !== null ? row.badge : row.existingProduct.badge,
            })
            .eq('id', row.existingProduct.id)

          if (error) {
            console.error('Error actualizando producto:', row.name, error)
            errorCount++
          } else {
            updatedCount++
          }
          continue
        }

        // If duplicateStrategy === 'duplicate', let it proceed to insert
      }

      // Insert new product
      let catId = row.categoryId
      if (!catId && row.categoryName) {
        catId = await getOrGenerateCategoryId(row.categoryName)
      }

      const { error } = await supabase.from('products').insert({
        title_es: row.name,
        title_en: row.name,
        description_es: row.description || '',
        description_en: row.description || '',
        price: row.price,
        category_id: catId,
        image_url: row.image || '',
        in_stock: row.inStock,
        badge: row.badge,
      })

      if (error) {
        console.error('Error insertando producto:', row.name, error)
        errorCount++
      } else {
        createdCount++
      }
    }

    setImportResults({
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
    })

    await refetchProducts()
    await refetchCategories()
    setStep('completed')
  }

  const newCount = parsedRows.filter((r) => !r.isExisting && !r.hasError).length
  const existingCount = parsedRows.filter((r) => r.isExisting && !r.hasError).length
  const invalidCount = parsedRows.filter((r) => r.hasError).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100 dark:border-purple-800/30">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-pink-500" />
            <h2 className="font-['Quicksand'] font-extrabold text-xl text-gray-800 dark:text-gray-100">
              Carga Masiva de Productos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-['Nunito'] mt-0.5">
            Importa decenas o cientos de artículos desde Excel, Google Sheets o archivos CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-purple-900/30 hover:bg-pink-200 dark:hover:bg-purple-900/50 text-pink-600 dark:text-pink-300 font-bold text-xs rounded-xl transition-all font-['Nunito'] shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Descargar Plantilla (.csv)
        </button>
      </div>

      {/* Shortcut banner to bulk photos */}
      {onGoToPhotos && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/60 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-['Nunito']">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="text-gray-700 dark:text-gray-300">
              ¿Ya importaste tus productos y quieres subir todas sus fotos juntas?
            </span>
          </div>
          <button
            type="button"
            onClick={onGoToPhotos}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all shadow-sm self-start sm:self-auto flex-shrink-0"
          >
            Subir Fotos Masivas →
          </button>
        </div>
      )}

      {/* STEP 1: INPUT */}
      {step === 'input' && (
        <div className="space-y-6">
          {/* Duplicate Strategy Selection (Recomendación inteligente) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-pink-50/50 dark:bg-purple-950/20 border border-pink-100 dark:border-purple-800/40 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h3 className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-200">
                ¿Qué hacer si un producto ya existe en tu catálogo?
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-['Nunito']">
              El sistema detecta automáticamente coincidencias por el <strong>nombre del producto</strong>. Elige cómo deseas procesarlos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Update (Recommended) */}
              <label
                className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  duplicateStrategy === 'update'
                    ? 'border-pink-500 bg-white dark:bg-[#1F1B24] shadow-md'
                    : 'border-pink-200/60 dark:border-purple-800/30 bg-white/60 dark:bg-[#1F1B24]/60 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-['Nunito'] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
                    Actualizar Existentes
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-pink-500 text-white uppercase">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-['Nunito'] leading-snug">
                  Actualiza precio y categoría. <em>Si no incluyes foto en el archivo, conserva las fotos que ya tenía.</em>
                </p>
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="update"
                  checked={duplicateStrategy === 'update'}
                  onChange={() => setDuplicateStrategy('update')}
                  className="hidden"
                />
              </label>

              {/* Option 2: Skip */}
              <label
                className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  duplicateStrategy === 'skip'
                    ? 'border-pink-500 bg-white dark:bg-[#1F1B24] shadow-md'
                    : 'border-pink-200/60 dark:border-purple-800/30 bg-white/60 dark:bg-[#1F1B24]/60 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-['Nunito'] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Omitir Duplicados
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-['Nunito'] leading-snug">
                  Solo crea los productos nuevos y salta los que ya existan sin alterar tu catálogo actual.
                </p>
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="skip"
                  checked={duplicateStrategy === 'skip'}
                  onChange={() => setDuplicateStrategy('skip')}
                  className="hidden"
                />
              </label>

              {/* Option 3: Duplicate */}
              <label
                className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  duplicateStrategy === 'duplicate'
                    ? 'border-pink-500 bg-white dark:bg-[#1F1B24] shadow-md'
                    : 'border-pink-200/60 dark:border-purple-800/30 bg-white/60 dark:bg-[#1F1B24]/60 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-['Nunito'] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    Crear de todos modos
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-['Nunito'] leading-snug">
                  Crea un nuevo registro para cada fila, incluso si ya existe un producto con el mismo nombre.
                </p>
                <input
                  type="radio"
                  name="duplicateStrategy"
                  value="duplicate"
                  checked={duplicateStrategy === 'duplicate'}
                  onChange={() => setDuplicateStrategy('duplicate')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoCats"
                checked={autoCreateCategories}
                onChange={(e) => setAutoCreateCategories(e.target.checked)}
                className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
              />
              <label htmlFor="autoCats" className="text-xs text-gray-600 dark:text-gray-300 font-['Nunito'] cursor-pointer">
                Crear automáticamente las categorías del archivo si aún no existen en la base de datos
              </label>
            </div>
          </div>

          {/* Upload Dropzone / File Picker */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 p-6 rounded-2xl border-2 border-dashed border-pink-300 dark:border-purple-700/50 hover:bg-pink-50/40 dark:hover:bg-purple-900/10 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
            >
              <UploadCloud className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 font-['Nunito']">
                Selecciona o arrastra tu archivo .CSV
              </p>
              <p className="text-xs text-gray-400 font-['Nunito'] mt-0.5">
                Archivos exportados desde Excel o Google Sheets
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Paste Raw Text Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-['Nunito'] uppercase tracking-wider">
              O pega directamente las celdas copiadas de Excel / CSV aquí:
            </label>
            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`nombre\tcategoria\tprecio\tdescripcion\nPeluche Pusheen\tPeluches y Coleccionables\t350.00\tPeluche original\nTaza Gatito\tHogar Cocina y Decoracion\t180.00\tTaza de ceramica`}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200 outline-none focus:border-pink-400 transition-colors"
            />
            <p className="text-[11px] text-gray-400 font-['Nunito']">
              Formato esperado: Columnas separadas por tabulación (copiar y pegar de Excel) o por comas (CSV).
            </p>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleProcessPreview}
            disabled={!inputText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl shadow-lg shadow-pink-300/30 transition-all font-['Nunito'] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Previsualizar y Validar Datos
          </button>
        </div>
      )}

      {/* STEP 2: PREVIEW & CONFIRM */}
      {step === 'preview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40 text-center">
              <span className="block text-2xl font-black text-purple-600 dark:text-purple-300 font-['Quicksand']">
                {parsedRows.length}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-['Nunito']">
                Total filas
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-300 font-['Quicksand']">
                {newCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-['Nunito']">
                Nuevos a crear
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-center">
              <span className="block text-2xl font-black text-amber-600 dark:text-amber-300 font-['Quicksand']">
                {existingCount}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-['Nunito']">
                {duplicateStrategy === 'update'
                  ? 'Se actualizarán'
                  : duplicateStrategy === 'skip'
                  ? 'Se omitirán'
                  : 'Se duplicarán'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/40 text-center">
              <span className="block text-2xl font-black text-red-600 dark:text-red-300 font-['Quicksand']">
                {invalidCount}
              </span>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 font-['Nunito']">
                Con errores
              </span>
            </div>
          </div>

          {/* Strategy reminder banner */}
          <div className="p-3.5 rounded-xl bg-pink-50/70 dark:bg-purple-900/20 border border-pink-200/60 dark:border-purple-800/30 flex items-center justify-between text-xs font-['Nunito']">
            <span>
              Modo duplicados:{' '}
              <strong className="text-pink-600 dark:text-pink-300">
                {duplicateStrategy === 'update'
                  ? '⚡ Actualizar información de existentes'
                  : duplicateStrategy === 'skip'
                  ? '🛡️ Omitir los que ya existen'
                  : '➕ Crear como nuevos registros'}
              </strong>
            </span>
            <button
              onClick={() => setStep('input')}
              className="text-pink-600 dark:text-pink-300 underline font-bold hover:text-pink-700"
            >
              Cambiar
            </button>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-2xl border border-pink-100 dark:border-purple-800/30">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-['Nunito']">
              <thead>
                <tr className="bg-pink-50/60 dark:bg-[#1F1B24] border-b border-pink-100 dark:border-purple-800/30 text-gray-600 dark:text-gray-300 font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Acción a realizar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-purple-900/20 bg-white dark:bg-[#251f2d]">
                {parsedRows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-pink-50/30 dark:hover:bg-purple-900/10">
                    <td className="p-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{row.name}</div>
                      {row.description && (
                        <div className="text-[11px] text-gray-400 line-clamp-1">{row.description}</div>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {row.categoryName || <span className="text-gray-400 italic">Sin categoría</span>}
                    </td>
                    <td className="p-3 font-extrabold text-[#581566] dark:text-pink-300">
                      ${row.price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {row.hasError ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                          <AlertCircle className="w-3 h-3" /> {row.errorMessage}
                        </span>
                      ) : row.isExisting ? (
                        duplicateStrategy === 'update' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            <RefreshCw className="w-3 h-3" /> Se actualizará
                          </span>
                        ) : duplicateStrategy === 'skip' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <X className="w-3 h-3" /> Se omitirá
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            Se duplicará
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Nuevo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedRows.length > 50 && (
            <p className="text-center text-xs text-gray-400 font-['Nunito']">
              Mostrando las primeras 50 filas de {parsedRows.length}.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={newCount === 0 && (duplicateStrategy !== 'update' || existingCount === 0)}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200/40 dark:shadow-emerald-900/30 transition-all font-['Nunito'] text-sm"
            >
              Confirmar e Importar {newCount + (duplicateStrategy === 'update' ? existingCount : 0)} productos
            </button>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-6 py-3.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-['Nunito'] text-sm"
            >
              Volver a editar
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IMPORTING PROGRESS */}
      {step === 'importing' && (
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-pink-200 dark:border-purple-800 border-t-pink-500 rounded-full animate-spin" />
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">
            Cargando productos en la base de datos...
          </h3>
          <p className="text-sm text-gray-500 font-['Nunito']">
            Procesando {progress.current} de {progress.total}
          </p>
          <div className="max-w-md mx-auto w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 4: COMPLETED */}
      {step === 'completed' && (
        <div className="p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-['Quicksand'] font-extrabold text-2xl text-emerald-700 dark:text-emerald-300">
            ¡Carga Masiva Exitosa!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-['Nunito'] max-w-md mx-auto">
            La información se sincronizó correctamente con tu base de datos de Supabase.
          </p>

          <div className="flex justify-center gap-4 py-2">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1F1B24] border border-emerald-100 dark:border-emerald-900 shadow-sm">
              <span className="block text-xl font-black text-emerald-600">{importResults.created}</span>
              <span className="text-xs text-gray-400 font-['Nunito']">Creados</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1F1B24] border border-amber-100 dark:border-amber-900 shadow-sm">
              <span className="block text-xl font-black text-amber-600">{importResults.updated}</span>
              <span className="text-xs text-gray-400 font-['Nunito']">Actualizados</span>
            </div>
            {importResults.skipped > 0 && (
              <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1F1B24] border border-gray-200 dark:border-gray-800 shadow-sm">
                <span className="block text-xl font-black text-gray-500">{importResults.skipped}</span>
                <span className="text-xs text-gray-400 font-['Nunito']">Omitidos</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setInputText('')
                setStep('input')
              }}
              className="px-6 py-2.5 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-sm font-['Nunito'] hover:bg-emerald-100/50 transition-all"
            >
              Cargar más productos
            </button>
            {onDone && (
              <button
                type="button"
                onClick={onDone}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm font-['Nunito'] shadow-md transition-all"
              >
                Ver catálogo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
