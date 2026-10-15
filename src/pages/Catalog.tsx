import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories, useProducts } from '../hooks/useSupabase'
import { useReveal, useMounted } from '../hooks/useAnimations'
import { WHATSAPP_NUMBER } from '../lib/supabase'
import type { Product } from '../types'
import { Search, ShoppingBag, Sparkles, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { getProductIdFromUrl } from '../lib/share'

export default function Catalog() {
  const { t, i18n } = useTranslation()
  const { products, loading: loadingProducts } = useProducts()
  const { categories, loading: loadingCategories } = useCategories()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [modalProduct, setModalProduct] = useState<{ product: Product; imgIndex: number } | null>(null)
  const mounted = useMounted()
  const headerReveal = useReveal(0.1)

  const lang = i18n.language as 'es' | 'en'

  // Auto-open product modal if opened via shared product URL
  useEffect(() => {
    if (products.length === 0) return
    const sharedId = getProductIdFromUrl()
    if (sharedId) {
      const found = products.find((p) => p.id === sharedId)
      if (found) {
        setModalProduct({ product: found, imgIndex: 0 })
      }
    }
  }, [products])

  const handleOpenModal = useCallback((product: Product, imgIndex: number) => {
    setModalProduct({ product, imgIndex })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalProduct(null)
    const hash = window.location.hash
    if (hash.includes('product=')) {
      const cleanHash = hash.replace(/[?&]product=[^&]+/, '')
      window.history.replaceState(null, '', `${window.location.pathname}${cleanHash}`)
    }
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.title_es.toLowerCase().includes(search.toLowerCase()) ||
        p.title_en.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || p.category_id === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, activeCategory])

  const openWhatsApp = useCallback((title: string, price: number) => {
    const msg = t('whatsapp_msg', { title, price: price.toFixed(2) })
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }, [t])

  const getBadgeLabel = useCallback((badge: string | null) => {
    if (!badge) return null
    const key = `badge_${badge}` as const
    return t(key)
  }, [t])

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-200 dark:border-pink-800 border-t-pink-400 dark:border-t-pink-400 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <span className="text-gray-500 dark:text-gray-400 font-['Nunito'] font-semibold animate-pulse">
            {lang === 'es' ? 'Cargando productos...' : 'Loading products...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div
          ref={headerReveal.ref}
          className={`text-center mb-10 reveal ${headerReveal.revealed ? 'revealed' : ''}`}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <ShoppingBag className="w-6 h-6 text-pink-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold font-['Quicksand'] text-gradient">
              {t('catalog_title')}
            </h1>
          </div>
          <div className="mt-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/95 dark:bg-[#251f2d]/95 text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm border border-pink-200 dark:border-purple-800/40 shadow-xs">
              {lang === 'es' 
                ? `${filtered.length} productos disponibles` 
                : `${filtered.length} products available`}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-8 space-y-4 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Search */}
          <div className="max-w-md mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-400 transition-colors" />
            <input
              type="text"
              placeholder={t('catalog_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white dark:bg-[#2a2430] border border-pink-200 dark:border-purple-700/50 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/30 outline-none text-sm font-['Nunito'] text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-md"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-pink-100 dark:hover:bg-purple-800/30 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold font-['Nunito'] transition-all duration-300 btn-press ${
                !activeCategory
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md shadow-pink-200/40 dark:shadow-pink-900/30 scale-105'
                  : 'bg-white dark:bg-[#2a2430] text-gray-600 dark:text-gray-300 border border-pink-200 dark:border-purple-700/50 hover:border-pink-300 dark:hover:border-purple-600 hover:shadow-sm'
              }`}
            >
              {t('catalog_all')}
            </button>
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold font-['Nunito'] transition-all duration-300 btn-press ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md shadow-pink-200/40 dark:shadow-pink-900/30 scale-105'
                    : 'bg-white dark:bg-[#2a2430] text-gray-600 dark:text-gray-300 border border-pink-200 dark:border-purple-700/50 hover:border-pink-300 dark:hover:border-purple-600 hover:shadow-sm'
                }`}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {lang === 'es' ? cat.name_es : cat.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="inline-flex p-6 rounded-full bg-pink-50 dark:bg-purple-900/20 mb-4">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-['Nunito'] text-lg">
              {t('catalog_empty')}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-pink-500 font-['Nunito'] font-semibold text-sm hover:text-pink-600 transition-colors"
              >
                {lang === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                lang={lang}
                getBadgeLabel={getBadgeLabel}
                openWhatsApp={openWhatsApp}
                onOpenModal={handleOpenModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View / Full Photos Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct.product}
          initialImgIndex={modalProduct.imgIndex}
          lang={lang}
          getBadgeLabel={getBadgeLabel}
          openWhatsApp={openWhatsApp}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

