import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth, useCategories, useProducts, useShippingMethods, useSiteSettings } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import type { Category, Product, ShippingMethod } from '../types'
import AnimatedStar from '../components/AnimatedStar'
import {
  Edit3,
  ImagePlus,
  Layers,
  LogIn,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Truck,
  X,
} from 'lucide-react'

type Tab = 'products' | 'categories' | 'shipping' | 'banner'

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
    { key: 'categories', label: t('admin_categories'), icon: <Layers className="w-4 h-4" /> },
    { key: 'shipping', label: t('admin_shipping'), icon: <Truck className="w-4 h-4" /> },
    { key: 'banner', label: 'Banner & Temporada', icon: <MessageSquare className="w-4 h-4" /> },
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
          {tab === 'products' && <ProductsAdmin />}
          {tab === 'categories' && <CategoriesAdmin />}
          {tab === 'shipping' && <ShippingAdmin />}
          {tab === 'banner' && <BannerAdmin />}
        </div>
      </div>
    </div>
  )
}

/* ─── Products CRUD ───────────────────────────────────── */
function ProductsAdmin() {
  const { t } = useTranslation()
  const { products, refetch } = useProducts()
  const { categories } = useCategories()
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  const emptyProduct: Omit<Product, 'id' | 'created_at'> = {
    title_es: '', title_en: '', description_es: '', description_en: '',
    price: 0, category_id: null, image_url: '', in_stock: true, badge: null,
  }
  const [form, setForm] = useState(emptyProduct)

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) {
      console.error('Error uploading image to Supabase Storage:', error)
      alert(`Error al subir imagen: ${error.message}. Asegúrate de que el bucket 'product-images' exista y sea público en Supabase.`)
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm({ ...form, image_url: data.publicUrl })
    }
    setUploading(false)
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
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 font-['Nunito'] mb-1">{t('admin_image')}</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-pink-200 dark:border-purple-700/50 text-pink-500 dark:text-pink-300 cursor-pointer hover:bg-pink-50 dark:hover:bg-purple-900/10 transition-all font-['Nunito'] text-sm font-semibold">
                <ImagePlus className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </label>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-pink-200 dark:border-purple-700/50" />
              )}
            </div>
            <InputField label="URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">{t('admin_products')}</h3>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
          <Plus className="w-4 h-4" />
          {t('admin_add')}
        </button>
      </div>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20">
            <img src={p.image_url} alt={p.title_es} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{p.title_es}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">${p.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-500 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 font-['Nunito'] py-8">{t('catalog_empty')}</p>
        )}
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

  const handleSave = async () => {
    let result
    if (editing) {
      result = await supabase.from('categories').update(form).eq('id', editing.id)
    } else {
      result = await supabase.from('categories').insert(form)
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">{t('admin_categories')}</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
            <Plus className="w-4 h-4" />
            {t('admin_add')}
          </button>
        )}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Quicksand'] font-bold text-lg text-gray-800 dark:text-gray-100">{t('admin_shipping')}</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all font-['Nunito']">
            <Plus className="w-4 h-4" />
            {t('admin_add')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('admin_title_es')} value={form.title_es} onChange={(v) => setForm({ ...form, title_es: v })} />
            <InputField label={t('admin_title_en')} value={form.title_en} onChange={(v) => setForm({ ...form, title_en: v })} />
            <TextareaField label={t('admin_desc_es')} value={form.description_es} onChange={(v) => setForm({ ...form, description_es: v })} />
            <TextareaField label={t('admin_desc_en')} value={form.description_en} onChange={(v) => setForm({ ...form, description_en: v })} />
            <InputField label={t('admin_cost_note')} value={form.cost_note} onChange={(v) => setForm({ ...form, cost_note: v })} />
            <InputField label={t('admin_delivery_time')} value={form.delivery_time} onChange={(v) => setForm({ ...form, delivery_time: v })} />
            <InputField label={t('admin_sort_order')} value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })} type="number" />
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
        {methods.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1F1B24] border border-pink-100/50 dark:border-purple-800/20">
            <div>
              <p className="font-['Quicksand'] font-bold text-sm text-gray-800 dark:text-gray-100">{m.title_es}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito']">{m.cost_note} — {m.delivery_time}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-500 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 font-['Nunito'] py-8">{t('shipping_empty')}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Banner & Temporada Settings ─────────────────────── */
function BannerAdmin() {
  const { settings, refetch } = useSiteSettings()

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
  const [uploadingSeason, setUploadingSeason] = useState(false)
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

  const handleSave = async () => {
    // 1. Guardar en localStorage para disponibilidad inmediata
    const seasonData = {
      season_image_url: form.season_image_url,
      season_title_es: form.season_title_es,
      season_title_en: form.season_title_en,
      season_desc_es: form.season_desc_es,
      season_desc_en: form.season_desc_en,
    }
    localStorage.setItem('magic_season_settings', JSON.stringify(seasonData))

    // 2. Intentar actualizar en Supabase site_settings
    let result = await supabase.from('site_settings').update(form).eq('id', 'main_config')
    if (result.error) {
      // Fallback: guardar columnas estándar de banner si la tabla aún no tiene las columnas de temporada
      const basicForm = {
        banner_text_es: form.banner_text_es,
        banner_text_en: form.banner_text_en,
        banner_active: form.banner_active,
        banner_link: form.banner_link,
      }
      result = await supabase.from('site_settings').update(basicForm).eq('id', 'main_config')
      if (result.error) {
        console.error('Error saving site_settings:', result.error)
        alert(`Error al guardar configuración: ${result.error.message}`)
        return
      }
    }

    refetch()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Sección 1: Banner Superior */}
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

      {/* Sección 2: Temporada e Imagen de Inicio */}
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
