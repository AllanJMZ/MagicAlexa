import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEMO_CATEGORIES, DEMO_SHIPPING, useAuth, useCategories, useProducts, useShippingMethods, useSiteSettings } from '../hooks/useSupabase'
import { useFeaturedProducts } from '../hooks/useFeaturedProducts'
import { useProductViews } from '../hooks/useProductViews'
import { useSiteBackground } from '../hooks/useSiteBackground'
import { supabase } from '../lib/supabase'
import type { Category, Product, ShippingMethod } from '../types'
import { getProductImages } from '../types'
import AnimatedStar from '../components/AnimatedStar'
import BulkImportAdmin from '../components/BulkImportAdmin'
import BulkPhotosAdmin from '../components/BulkPhotosAdmin'
import {
  Camera,
  Edit3,
  Eye,
  FileSpreadsheet,
  ImagePlus,
  Layers,
  LogIn,
  LogOut,
  Package,
  Palette,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react'

type Tab = 'products' | 'bulk' | 'photos' | 'featured' | 'categories' | 'shipping' | 'banner'

export default function Admin() {
  const { t } = useTranslation()
  const { user, loading: authLoading, login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('products')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const error = await login(email, password)
    if (error) setLoginError(error.message)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-200 dark:border-pink-800 border-t-pink-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 dark:bg-[#2a2430]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100/60 dark:border-purple-800/40 p-8 sm:p-10">
            <div className="text-center mb-8">
              <AnimatedStar className="mb-4" />
              <h1 className="font-['Quicksand'] font-bold text-2xl text-gradient">
                {t('admin_title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-['Nunito'] mt-1">
                {t('admin_login_subtitle') || 'Ingresa tus credenciales para continuar'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">
                  {t('admin_email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/30 outline-none text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">
                  {t('admin_password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/30 outline-none text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 transition-all"
                  required
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                  <span className="text-red-500 text-sm font-['Nunito']">{loginError}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-['Nunito'] btn-press animate-glow"
              >
                <LogIn className="w-4 h-4" />
                {t('admin_login')}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 font-['Nunito'] mt-6">
              🔒 {t('admin_secure_note') || 'Conexión segura con Supabase Auth'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'products', label: t('admin_products'), icon: <Package className="w-4 h-4" /> },
    { key: 'bulk', label: '📥 Carga Masiva', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { key: 'photos', label: '📸 Fotos Masivas', icon: <Camera className="w-4 h-4" /> },
    { key: 'featured', label: '⭐ Carrusel Inicio', icon: <Star className="w-4 h-4" /> },
    { key: 'categories', label: t('admin_categories'), icon: <Layers className="w-4 h-4" /> },
    { key: 'shipping', label: t('admin_shipping'), icon: <Truck className="w-4 h-4" /> },
    { key: 'banner', label: '🎨 Banner, Fondo y Temporada', icon: <Palette className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {t('admin_title')}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 dark:border-red-800/50 text-red-500 dark:text-red-400 font-semibold text-sm font-['Nunito'] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t('admin_logout')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-['Nunito'] transition-all duration-300 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
                  : 'bg-white dark:bg-[#2a2430] text-gray-600 dark:text-gray-300 border border-pink-200 dark:border-purple-700/50 hover:border-pink-300 dark:hover:border-purple-600'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-[#2a2430] rounded-2xl border border-pink-100/50 dark:border-purple-800/30 shadow-sm p-6">
          {tab === 'products' && (
            <ProductsAdmin
              onOpenBulk={() => setTab('bulk')}
              onOpenPhotos={() => setTab('photos')}
            />
          )}
          {tab === 'bulk' && (
            <BulkImportAdmin
              onDone={() => setTab('products')}
              onGoToPhotos={() => setTab('photos')}
            />
          )}
          {tab === 'photos' && <BulkPhotosAdmin onDone={() => setTab('products')} />}
          {tab === 'featured' && <FeaturedAdmin />}
          {tab === 'categories' && <CategoriesAdmin />}
          {tab === 'shipping' && <ShippingAdmin />}
          {tab === 'banner' && <BannerAdmin />}
        </div>
      </div>
    </div>
  )
}

/* ─── Products CRUD ───────────────────────────────────── */
function ProductsAdmin({
  onOpenBulk,
  onOpenPhotos,
}: {
  onOpenBulk?: () => void
  onOpenPhotos?: () => void
}) {
  const { t } = useTranslation()
  const { products, refetch } = useProducts()
  const { categories } = useCategories()
  const { isFeatured, toggleFeatured } = useFeaturedProducts()
  const { getViewCount, getTotalViews, getTopViewedProducts } = useProductViews()
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'price_asc' | 'price_desc'>('recent')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  const emptyProduct: Omit<Product, 'id' | 'created_at'> = {
    title_es: '', title_en: '', description_es: '', description_en: '',
    price: 0, category_id: null, image_url: '', in_stock: true, badge: null,
  }
  const [form, setForm] = useState(emptyProduct)

  const currentImages = form.image_url
    ? form.image_url.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleMultipleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)
    const availableSlots = 3 - currentImages.length
    if (availableSlots <= 0) {
      alert('Ya alcanzaste el límite de 3 fotos para este producto.')
      return
    }
    const toUpload = fileArray.slice(0, availableSlots)
    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of toUpload) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) {
        console.error('Error uploading image to Supabase Storage:', error)
        alert(`Error al subir imagen: ${error.message}. Asegúrate de que el bucket 'product-images' exista y sea público en Supabase.`)
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
    }

    if (uploadedUrls.length > 0) {
      const updated = [...currentImages, ...uploadedUrls]
      setForm({ ...form, image_url: updated.join(',') })
    }
    setUploading(false)
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove)
    setForm({ ...form, image_url: updated.join(',') })
  }

  const handleSave = async () => {
    let result
    if (editing) {
      result = await supabase.from('products').update(form).eq('id', editing.id)
    } else {
      result = await supabase.from('products').insert(form)
    }
    if (result.error) {
      console.error('Error saving product:', result.error)
      alert(`Error al guardar producto: ${result.error.message}`)
      return
    }
    setEditing(null)
    setCreating(false)
    setForm(emptyProduct)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('admin_confirm_delete'))) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        console.error('Error deleting product:', error)
        alert(`Error al eliminar: ${error.message}`)
      }
      refetch()
    }
  }

  const startEdit = (p: Product) => {
    setEditing(p)
    setCreating(true)
    setForm({
      title_es: p.title_es, title_en: p.title_en,
      description_es: p.description_es || '', description_en: p.description_en || '',
      price: p.price, category_id: p.category_id, image_url: p.image_url,
      in_stock: p.in_stock, badge: p.badge,
    })
  }

  if (creating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">
            {editing ? t('admin_edit') : t('admin_add')} — {t('admin_products')}
          </h3>
          <button onClick={() => { setCreating(false); setEditing(null); setForm(emptyProduct) }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label={t('admin_title_es')} value={form.title_es} onChange={(v) => setForm({ ...form, title_es: v })} />
          <InputField label={t('admin_title_en')} value={form.title_en} onChange={(v) => setForm({ ...form, title_en: v })} />
          <TextareaField label={t('admin_desc_es')} value={form.description_es || ''} onChange={(v) => setForm({ ...form, description_es: v })} />
          <TextareaField label={t('admin_desc_en')} value={form.description_en || ''} onChange={(v) => setForm({ ...form, description_en: v })} />
          <InputField label={t('admin_price')} value={String(form.price)} onChange={(v) => setForm({ ...form, price: parseFloat(v) || 0 })} type="number" />
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">{t('admin_category')}</label>
            <select
              value={form.category_id || ''}
              onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 outline-none"
            >
              <option value="">{t('admin_no_category')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_es}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">{t('admin_badge')}</label>
            <select
              value={form.badge || ''}
              onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 outline-none"
            >
              <option value="">—</option>
              <option value="new">{t('badge_new')}</option>
              <option value="last">{t('badge_last')}</option>
              <option value="sold_out">{t('badge_sold_out')}</option>
              <option value="exclusive">{t('badge_exclusive')}</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito']">{t('admin_stock')}</label>
            <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
              className="w-5 h-5 rounded accent-pink-400" />
          </div>

          {/* Multi-Image Upload (Up to 3 photos) */}
          <div className="md:col-span-2 space-y-3 bg-pink-50/40 dark:bg-purple-900/10 p-4 rounded-2xl border border-pink-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 font-['Nunito']">
                  Fotos del producto ({currentImages.length}/3)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
                  Puedes subir hasta 3 fotos. La primera será la foto principal en la tienda.
                </p>
              </div>
              {currentImages.length < 3 && (
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-400 hover:bg-pink-500 text-white cursor-pointer transition-all font-['Nunito'] text-xs font-bold shadow-sm">
                  <ImagePlus className="w-3.5 h-3.5" />
                  {uploading ? 'Subiendo...' : 'Subir foto'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      handleMultipleImageUpload(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>

            {/* 3 Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIdx) => {
                const imgUrl = currentImages[slotIdx]
                const isPrimary = slotIdx === 0
                return (
                  <div
                    key={slotIdx}
                    className={`relative rounded-2xl border-2 transition-all p-3 flex flex-col items-center justify-center min-h-[140px] bg-white dark:bg-[#1F1B24] ${
                      imgUrl
                        ? 'border-pink-300 dark:border-purple-600/50 shadow-sm'
                        : 'border-dashed border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-['Nunito'] uppercase tracking-wider bg-pink-50 dark:bg-purple-900/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-purple-800">
                      {isPrimary ? '1: Principal' : `Foto ${slotIdx + 1}`}
                    </div>

                    {imgUrl ? (
                      <div className="w-full flex flex-col items-center pt-5">
                        <img
                          src={imgUrl}
                          alt={`Foto ${slotIdx + 1}`}
                          className="w-20 h-20 object-cover rounded-xl shadow-sm border border-pink-100 dark:border-purple-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(slotIdx)}
                          className="mt-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 font-bold font-['Nunito'] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer p-4 text-center group w-full h-full">
                        <ImagePlus className="w-6 h-6 text-pink-300 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-gray-400 group-hover:text-pink-500 dark:text-gray-500 font-['Nunito']">
                          + Agregar foto {slotIdx + 1}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleMultipleImageUpload(e.target.files)
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>

            <InputField
              label="O pega URLs directas (separadas por coma)"
              value={form.image_url}
              onChange={(v) => setForm({ ...form, image_url: v })}
            />
          </div>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-['Nunito']">
          <Save className="w-4 h-4" />
          {t('admin_save')}
        </button>
      </div>
    )
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'views') {
      const vA = getViewCount(a.id, a)
      const vB = getViewCount(b.id, b)
      return vB - vA
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price
    }
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  })

  const topViewed = getTopViewedProducts(products, 5)
  const totalViews = getTotalViews(products)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">{t('admin_products')}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenBulk && (
            <button
              onClick={onOpenBulk}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-pink-100 dark:bg-purple-900/30 hover:bg-pink-200 dark:hover:bg-purple-900/50 text-pink-600 dark:text-pink-300 text-xs font-bold rounded-full border border-pink-200 dark:border-purple-700/50 transition-all font-['Nunito'] shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Carga Masiva
            </button>
          )}
          {onOpenPhotos && (
            <button
              onClick={onOpenPhotos}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-full border border-purple-200 dark:border-purple-700/50 transition-all font-['Nunito'] shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              Fotos Masivas
            </button>
          )}
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
            <Plus className="w-4 h-4" />
            {t('admin_add')}
          </button>
        </div>
      </div>

      {/* Widget de Métricas & Top Más Vistos */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-white dark:from-[#251d2e] dark:via-[#1e1924] dark:to-[#1a1620] border border-pink-200/80 dark:border-purple-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100/70 dark:border-purple-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Quicksand'] font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                Rendimiento & Productos Más Vistos
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300">
                  En Vivo
                </span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
                Total acumulado de visitas en el catálogo: <strong className="text-purple-600 dark:text-purple-400 font-bold">{totalViews} vistas</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-['Nunito']">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold font-['Nunito'] px-3 py-1.5 rounded-xl bg-white dark:bg-[#2a2430] border border-pink-200 dark:border-purple-700/50 text-gray-700 dark:text-gray-200 outline-none cursor-pointer shadow-sm hover:border-pink-300 transition-all"
            >
              <option value="recent">🕒 Más recientes</option>
              <option value="views">🔥 Más vistos (Popularidad)</option>
              <option value="price_asc">💵 Menor precio</option>
              <option value="price_desc">💎 Mayor precio</option>
            </select>
          </div>
        </div>

        {/* Top 5 Leaderboard Cards */}
        {topViewed.length > 0 ? (
          <div className="mt-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 font-['Nunito'] mb-2 flex items-center gap-1">
              <span>🔥</span> Podio de los más vistos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {topViewed.map((item, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`
                const imgs = getProductImages(item.product)
                const img = imgs[0] || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400'
                return (
                  <div
                    key={item.product.id}
                    onClick={() => startEdit(item.product)}
                    className="group relative flex items-center gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-[#1a1622]/80 border border-pink-100/70 dark:border-purple-800/30 hover:border-pink-300 dark:hover:border-purple-600 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                    title="Haz clic para editar este producto"
                  >
                    <span className="text-base select-none">{medal}</span>
                    <img
                      src={img}
                      alt={item.product.title_es}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-pink-100 dark:border-purple-900"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold font-['Quicksand'] text-gray-800 dark:text-gray-100 truncate group-hover:text-pink-500 transition-colors">
                        {item.product.title_es}
                      </p>
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 font-['Nunito'] flex items-center gap-1">
                        <Eye className="w-3 h-3 inline" /> {item.views} vistas
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-['Nunito'] italic">
            Aún no hay vistas registradas. Las vistas aumentarán automáticamente cuando los usuarios exploren los productos en el catálogo o hagan pedidos por WhatsApp.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {sortedProducts.map((p) => {
          const imgs = getProductImages(p)
          const firstImg = imgs[0] || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400'
          const views = getViewCount(p.id, p)
          return (
            <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20">
              <div className="relative flex-shrink-0">
                <img src={firstImg} alt={p.title_es} className="w-14 h-14 rounded-lg object-cover" />
                {imgs.length > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {imgs.length} fotos
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{p.title_es}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-['Nunito']">
                    <Eye className="w-3 h-3 text-purple-500" />
                    {views} {views === 1 ? 'vista' : 'vistas'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">${p.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const res = toggleFeatured(p.id)
                    if (!res.success && res.message) alert(res.message)
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isFeatured(p.id)
                      ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100'
                      : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isFeatured(p.id) ? 'Destacado en Inicio (clic para quitar)' : 'Destacar en carrusel de inicio (hasta 10)'}
                >
                  <Star className={`w-4 h-4 ${isFeatured(p.id) ? 'fill-yellow-400' : ''}`} />
                </button>
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-500 transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
        {sortedProducts.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 font-['Nunito'] py-8">{t('catalog_empty')}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Featured Products (Carrusel Inicio) Admin ──────── */
function FeaturedAdmin() {
  const { products } = useProducts()
  const { featuredIds, isFeatured, toggleFeatured, setFeaturedIds } = useFeaturedProducts()

  const handleToggle = (id: string) => {
    const res = toggleFeatured(id)
    if (!res.success && res.message) {
      alert(res.message)
    }
  }

  const handleSelectFirst10 = () => {
    const first10 = products.slice(0, 10).map((p) => p.id)
    setFeaturedIds(first10)
  }

  const handleClearAll = () => {
    if (confirm('¿Deseas desmarcar todos los artículos destacados?')) {
      setFeaturedIds([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">
              ⭐ Carrusel de Inicio (Artículos Destacados)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-purple-900/40 text-pink-600 dark:text-pink-300">
              {featuredIds.length}/10 seleccionados
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito'] mt-0.5">
            Selecciona hasta 10 artículos para mostrarlos en el mini carrusel de la página principal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectFirst10}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-purple-900/30 text-pink-600 dark:text-pink-300 hover:bg-pink-200 transition-all font-['Nunito']"
          >
            Primeros 10
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-all font-['Nunito']"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((p) => {
          const imgs = getProductImages(p)
          const firstImg = imgs[0] || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400'
          const featured = isFeatured(p.id)

          return (
            <div
              key={p.id}
              onClick={() => handleToggle(p.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                featured
                  ? 'border-yellow-300 dark:border-yellow-600/50 bg-yellow-50/40 dark:bg-yellow-900/10 shadow-sm'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1F1B24]'
              }`}
            >
              <input
                type="checkbox"
                checked={featured}
                onChange={() => {}}
                className="w-4 h-4 rounded accent-pink-400 cursor-pointer"
              />
              <img src={firstImg} alt={p.title_es} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                  {p.title_es}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
                  ${p.price.toFixed(2)}
                </p>
              </div>
              <Star
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Categories CRUD ───────────────────────────────── */
function CategoriesAdmin() {
  const { t } = useTranslation()
  const { categories, refetch } = useCategories()
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name_es: '', name_en: '', slug: '' })
  const [showForm, setShowForm] = useState(false)
  const [loadingOfficial, setLoadingOfficial] = useState(false)

  const handleLoadOfficialCategories = async () => {
    if (!confirm('¿Deseas registrar las 7 categorías oficiales en la base de datos de Supabase?')) return
    setLoadingOfficial(true)
    let added = 0
    for (const cat of DEMO_CATEGORIES) {
      const exists = categories.some((c) => c.slug === cat.slug || c.name_es.toLowerCase() === cat.name_es.toLowerCase())
      if (!exists) {
        const { error } = await supabase.from('categories').insert({
          name_es: cat.name_es,
          name_en: cat.name_en,
          slug: cat.slug,
        })
        if (!error) added++
      }
    }
    setLoadingOfficial(false)
    refetch()
    alert(added > 0 ? `¡Se agregaron ${added} categorías oficiales con éxito!` : 'Todas las 7 categorías oficiales ya están registradas.')
  }

  const handleSave = async () => {
    if (!form.name_es.trim()) {
      alert('Por favor ingresa al menos el nombre en español de la categoría.')
      return
    }

    const slugValue = (form.slug.trim() || form.name_es)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const payload = {
      name_es: form.name_es.trim(),
      name_en: form.name_en.trim() || form.name_es.trim(),
      slug: slugValue,
    }

    let result
    if (editing) {
      result = await supabase.from('categories').update(payload).eq('id', editing.id)
    } else {
      result = await supabase.from('categories').insert(payload)
    }
    if (result.error) {
      console.error('Error saving category:', result.error)
      alert(`Error al guardar categoría: ${result.error.message}`)
      return
    }
    reset()
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('admin_confirm_delete'))) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        console.error('Error deleting category:', error)
        alert(`Error al eliminar categoría: ${error.message}`)
      }
      refetch()
    }
  }

  const startEdit = (c: Category) => {
    setEditing(c)
    setForm({ name_es: c.name_es, name_en: c.name_en, slug: c.slug })
    setShowForm(true)
  }

  const reset = () => {
    setEditing(null)
    setForm({ name_es: '', name_en: '', slug: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">{t('admin_categories')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
            Organiza tus productos en colecciones temáticas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadOfficialCategories}
            disabled={loadingOfficial}
            className="flex items-center gap-1.5 px-3 py-2 bg-pink-100 dark:bg-purple-900/30 hover:bg-pink-200 dark:hover:bg-purple-900/50 text-pink-600 dark:text-pink-300 text-xs font-bold rounded-full border border-pink-200 dark:border-purple-700/50 transition-all font-['Nunito'] shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            {loadingOfficial ? 'Cargando...' : 'Cargar 7 Categorías Oficiales'}
          </button>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
              <Plus className="w-4 h-4" />
              {t('admin_add')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputField label={t('admin_name_es')} value={form.name_es} onChange={(v) => setForm({ ...form, name_es: v })} />
            <InputField label={t('admin_name_en')} value={form.name_en} onChange={(v) => setForm({ ...form, name_en: v })} />
            <InputField label={t('admin_slug')} value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-lg shadow-md transition-all font-['Nunito']">
              <Save className="w-4 h-4" />
              {t('admin_save')}
            </button>
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-lg transition-all font-['Nunito']">
              <X className="w-4 h-4" />
              {t('admin_cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20">
            <div>
              <p className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-100">{c.name_es} / {c.name_en}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">slug: {c.slug}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-500 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 font-['Nunito'] py-8">{t('catalog_empty')}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Shipping CRUD ──────────────────────────────────── */
function ShippingAdmin() {
  const { t } = useTranslation()
  const { methods, refetch } = useShippingMethods()
  const [editing, setEditing] = useState<ShippingMethod | null>(null)
  const [showForm, setShowForm] = useState(false)
  const emptyForm = { title_es: '', title_en: '', description_es: '', description_en: '', cost_note: '', delivery_time: '', sort_order: 0 }
  const [form, setForm] = useState(emptyForm)

  const handleSave = async () => {
    let result
    if (editing) {
      result = await supabase.from('shipping_methods').update(form).eq('id', editing.id)
    } else {
      result = await supabase.from('shipping_methods').insert(form)
    }
    if (result.error) {
      console.error('Error saving shipping method:', result.error)
      alert(`Error al guardar método de envío: ${result.error.message}`)
      return
    }
    reset()
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('admin_confirm_delete'))) {
      const { error } = await supabase.from('shipping_methods').delete().eq('id', id)
      if (error) {
        console.error('Error deleting shipping method:', error)
        alert(`Error al eliminar método de envío: ${error.message}`)
      }
      refetch()
    }
  }

  const startEdit = (m: ShippingMethod) => {
    setEditing(m)
    setForm({
      title_es: m.title_es, title_en: m.title_en,
      description_es: m.description_es || '', description_en: m.description_en || '',
      cost_note: m.cost_note || '', delivery_time: m.delivery_time || '', sort_order: m.sort_order,
    })
    setShowForm(true)
  }

  const reset = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleLoadDefaults = async () => {
    const defaults = DEMO_SHIPPING.map(({ title_es, title_en, description_es, description_en, cost_note, delivery_time, sort_order }) => ({
      title_es, title_en, description_es, description_en, cost_note, delivery_time, sort_order
    }))
    const { error } = await supabase.from('shipping_methods').insert(defaults)
    if (error) {
      console.error('Error inserting default shipping cards:', error)
      alert(`Error al cargar tarjetas de envío: ${error.message}`)
    } else {
      refetch()
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>📦</span> Tarjetas de Información de Envíos
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
            Estas tarjetas se muestran en la página pública de Envíos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {methods.length === 0 && (
            <button
              onClick={handleLoadDefaults}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/30 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold rounded-full transition-all font-['Nunito'] border border-pink-200 dark:border-pink-800/40"
            >
              <span>✨</span> Cargar 3 Tarjetas Recomendadas
            </button>
          )}
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
              <Plus className="w-4 h-4" />
              {t('admin_add')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 font-['Quicksand']">
            {editing ? 'Editar Tarjeta de Envío' : 'Nueva Tarjeta de Envío'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Título (Español)" value={form.title_es} onChange={(v) => setForm({ ...form, title_es: v })} />
            <InputField label="Título (Inglés)" value={form.title_en} onChange={(v) => setForm({ ...form, title_en: v })} />
            <TextareaField label="Descripción detallada (Español)" value={form.description_es} onChange={(v) => setForm({ ...form, description_es: v })} />
            <TextareaField label="Descripción detallada (Inglés)" value={form.description_en} onChange={(v) => setForm({ ...form, description_en: v })} />
            <InputField label="Costo / Tarifa (ej: Gratis, $99 MXN)" value={form.cost_note} onChange={(v) => setForm({ ...form, cost_note: v })} />
            <InputField label="Tiempo de entrega (ej: 2-4 días)" value={form.delivery_time} onChange={(v) => setForm({ ...form, delivery_time: v })} />
            <InputField label="Orden de aparición" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-xl shadow-md transition-all font-['Nunito']">
              <Save className="w-4 h-4" />
              {t('admin_save')}
            </button>
            <button onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition-all font-['Nunito']">
              <X className="w-4 h-4" />
              {t('admin_cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {methods.map((m) => (
          <div key={m.id} className="flex items-start sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30 gap-4 shadow-sm">
            <div className="space-y-1">
              <p className="font-['Quicksand'] font-bold text-base text-gray-800 dark:text-gray-100">{m.title_es}</p>
              {m.description_es && (
                <p className="text-xs text-gray-600 dark:text-gray-300 font-['Nunito'] line-clamp-2 max-w-xl">{m.description_es}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-pink-600 dark:text-pink-400 font-bold font-['Nunito']">
                {m.cost_note && <span>💰 {m.cost_note}</span>}
                {m.delivery_time && <span>⏱️ {m.delivery_time}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-500 transition-all" title="Editar">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all" title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <div className="text-center py-8 bg-gray-50/50 dark:bg-[#1F1B24]/50 rounded-2xl border border-dashed border-pink-200 dark:border-purple-800/30">
            <p className="text-gray-400 dark:text-gray-500 font-['Nunito'] mb-3">Aún no hay métodos de envío guardados en la base de datos.</p>
            <button
              onClick={handleLoadDefaults}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']"
            >
              <span>✨</span> Cargar las 3 Tarjetas Recomendadas
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Banner, Fondo & Temporada Settings ─────────────────────── */
function BannerAdmin() {
  const { settings, refetch } = useSiteSettings()
  const { bgUrl, saveBgUrl } = useSiteBackground()

  const localSeasonal = (() => {
    try {
      return JSON.parse(localStorage.getItem('magic_season_settings') || '{}')
    } catch {
      return {}
    }
  })()

  const [form, setForm] = useState({
    banner_text_es: settings?.banner_text_es || '',
    banner_text_en: settings?.banner_text_en || '',
    banner_active: settings?.banner_active ?? true,
    banner_link: settings?.banner_link || '',
    season_image_url: settings?.season_image_url || localSeasonal.season_image_url || './season-image.jpg',
    season_title_es: settings?.season_title_es || localSeasonal.season_title_es || '✨ Temporada Otoño 2026',
    season_title_en: settings?.season_title_en || localSeasonal.season_title_en || '✨ Autumn Season 2026',
    season_desc_es: settings?.season_desc_es || localSeasonal.season_desc_es || 'Nuevas piezas de la colección de temporada ya disponibles 🍂',
    season_desc_en: settings?.season_desc_en || localSeasonal.season_desc_en || 'New seasonal collection pieces now available 🍂',
  })

  const [currentBgUrl, setCurrentBgUrl] = useState(bgUrl)
  const [uploadingSeason, setUploadingSeason] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSeasonImageUpload = async (file: File) => {
    setUploadingSeason(true)
    const ext = file.name.split('.').pop()
    const path = `season-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) {
      console.error('Error uploading seasonal image:', error)
      alert(`Error al subir imagen de temporada: ${error.message}. Asegúrate de que el bucket 'product-images' exista en Supabase.`)
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm((prev) => ({ ...prev, season_image_url: data.publicUrl }))
    }
    setUploadingSeason(false)
  }

  const handleBgImageUpload = async (file: File) => {
    setUploadingBg(true)
    const ext = file.name.split('.').pop()
    const path = `background-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) {
      console.error('Error uploading background image:', error)
      alert(`Error al subir imagen de fondo: ${error.message}. Asegúrate de que el bucket 'product-images' exista en Supabase.`)
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setCurrentBgUrl(data.publicUrl)
    }
    setUploadingBg(false)
  }

  const handleSave = async () => {
    // 1. Guardar foto de fondo optimizada directamente
    saveBgUrl(currentBgUrl)

    // 2. Guardar temporada en localStorage para disponibilidad inmediata
    const seasonData = {
      season_image_url: form.season_image_url,
      season_title_es: form.season_title_es,
      season_title_en: form.season_title_en,
      season_desc_es: form.season_desc_es,
      season_desc_en: form.season_desc_en,
    }
    localStorage.setItem('magic_season_settings', JSON.stringify(seasonData))

    // 3. Intentar actualizar en Supabase site_settings
    let result = await supabase.from('site_settings').update({
      ...form,
      bg_image_url: currentBgUrl,
    }).eq('id', 'main_config')
    if (result.error) {
      const basicForm = {
        banner_text_es: form.banner_text_es,
        banner_text_en: form.banner_text_en,
        banner_active: form.banner_active,
        banner_link: form.banner_link,
      }
      result = await supabase.from('site_settings').update(basicForm).eq('id', 'main_config')
      if (result.error) {
        console.error('Error saving site_settings:', result.error)
      }
    }

    refetch()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Sección 1: Foto de Fondo de la Tienda */}
      <div className="space-y-4 p-6 rounded-2xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>🖼️</span> Foto de Fondo de la Tienda
          </h3>
          {currentBgUrl && (
            <button
              type="button"
              onClick={() => setCurrentBgUrl('')}
              className="text-xs font-bold text-red-500 hover:text-red-600 font-['Nunito'] flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Quitar fondo (dejar limpio)
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">
          Sube la foto que quieras para el fondo de la tienda o escribe la URL de la imagen. La foto se aplicará directamente de forma optimizada y ultra rápida.
        </p>

        {/* Acciones rápidas */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setCurrentBgUrl('/bg-halloween.jpg')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-['Nunito'] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-700 hover:bg-purple-200 transition-all flex items-center gap-1.5 shadow-xs"
          >
            🦇 Murciélagos Halloween
          </button>
          <button
            type="button"
            onClick={() => setCurrentBgUrl('')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-['Nunito'] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 transition-all shadow-xs"
          >
            🚫 Sin fondo
          </button>
        </div>

        {/* Carga y URL directa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">
              Subir Foto desde tu Equipo
            </label>
            <label className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-pink-200 dark:border-purple-700/50 text-pink-500 dark:text-pink-300 cursor-pointer hover:bg-pink-50 dark:hover:bg-purple-900/10 transition-all font-['Nunito'] text-sm font-semibold">
              <ImagePlus className="w-4 h-4" />
              {uploadingBg ? 'Subiendo foto...' : 'Seleccionar Foto'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBgImageUpload(e.target.files[0])} />
            </label>
          </div>

          <div>
            <InputField
              label="O escribe/pega la URL de la foto"
              value={currentBgUrl}
              onChange={(v) => setCurrentBgUrl(v)}
            />
          </div>
        </div>

        {/* Vista previa */}
        {currentBgUrl ? (
          <div className="pt-2 flex items-center gap-3">
            <img
              src={currentBgUrl}
              alt="Vista previa del fondo"
              className="w-20 h-16 rounded-xl object-cover border border-pink-200 dark:border-purple-700 shadow-sm"
            />
            <div className="text-xs font-['Nunito'] text-gray-600 dark:text-gray-400">
              <p className="font-bold text-gray-700 dark:text-gray-300">Foto seleccionada</p>
              <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold">✓ Lista para mostrar en la tienda</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-['Nunito'] italic pt-1">
            Sin foto de fondo activa (se mostrará el color estándar de la tienda).
          </p>
        )}
      </div>

      {/* Sección 2: Banner Superior */}
      <div className="space-y-4 p-6 rounded-2xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30">
        <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>📢</span> Banner Superior de la Tienda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label="Texto del Banner (Español)" value={form.banner_text_es} onChange={(v) => setForm({ ...form, banner_text_es: v })} />
          <TextareaField label="Texto del Banner (Inglés)" value={form.banner_text_en} onChange={(v) => setForm({ ...form, banner_text_en: v })} />
          <InputField label="Enlace del Banner (Opcional)" value={form.banner_link} onChange={(v) => setForm({ ...form, banner_link: v })} />
          <div className="flex items-center gap-3 self-end pb-3">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito']">Banner Activo</label>
            <input type="checkbox" checked={form.banner_active} onChange={(e) => setForm({ ...form, banner_active: e.target.checked })}
              className="w-5 h-5 rounded accent-pink-400" />
          </div>
        </div>
      </div>

      {/* Sección 3: Temporada e Imagen de Inicio */}
      <div className="space-y-4 p-6 rounded-2xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30">
        <div className="flex items-center justify-between">
          <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>✨</span> Imagen y Colección de Temporada (Inicio)
          </h3>
          <span className="text-xs text-pink-500 font-semibold font-['Nunito']">Se muestra en la portada</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Título de Temporada (ES)" value={form.season_title_es} onChange={(v) => setForm({ ...form, season_title_es: v })} />
          <InputField label="Título de Temporada (EN)" value={form.season_title_en} onChange={(v) => setForm({ ...form, season_title_en: v })} />
          <TextareaField label="Descripción de Temporada (ES)" value={form.season_desc_es} onChange={(v) => setForm({ ...form, season_desc_es: v })} />
          <TextareaField label="Descripción de Temporada (EN)" value={form.season_desc_en} onChange={(v) => setForm({ ...form, season_desc_en: v })} />
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito']">
            Imagen de Temporada
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-pink-200 dark:border-purple-700/50 text-pink-500 dark:text-pink-300 cursor-pointer hover:bg-pink-50 dark:hover:bg-purple-900/10 transition-all font-['Nunito'] text-sm font-semibold">
              <ImagePlus className="w-4 h-4" />
              {uploadingSeason ? 'Subiendo imagen...' : 'Subir Imagen de Temporada'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSeasonImageUpload(e.target.files[0])} />
            </label>
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="O pega una URL de imagen..."
                value={form.season_image_url}
                onChange={(e) => setForm({ ...form, season_image_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 outline-none"
              />
            </div>
            {form.season_image_url && (
              <img
                src={form.season_image_url}
                alt="Vista previa temporada"
                className="w-16 h-16 rounded-xl object-cover border border-pink-200 dark:border-purple-700/50 shadow-sm"
              />
            )}
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className={`flex items-center gap-2 px-8 py-3.5 font-bold rounded-xl shadow-md transition-all duration-300 font-['Nunito'] ${
          saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-lg'
        }`}>
        <Save className="w-4 h-4" />
        {saved ? '✓ ¡Cambios Guardados!' : 'Guardar Todo'}
      </button>
    </div>
  )
}

/* ─── Reusable form fields ────────────────────────────── */
function InputField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/30 outline-none text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 transition-all"
      />
    </div>
  )
}

function TextareaField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-200 dark:border-purple-700/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/30 outline-none text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 transition-all resize-none"
      />
    </div>
  )
}
