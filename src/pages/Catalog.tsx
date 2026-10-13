import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories, useProducts } from '../hooks/useSupabase'
import { useReveal, useMounted } from '../hooks/useAnimations'
import { WHATSAPP_NUMBER } from '../lib/supabase'
import { getProductImages, type Product } from '../types'
import { ChevronLeft, ChevronRight, MessageCircle, Search, ShoppingBag, Sparkles, X } from 'lucide-react'

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  last: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  sold_out: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
  exclusive: 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white',
}

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

  const openWhatsApp = (title: string, price: number) => {
    const msg = t('whatsapp_msg', { title, price: price.toFixed(2) })
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const getBadgeLabel = (badge: string | null) => {
    if (!badge) return null
    const key = `badge_${badge}` as const
    return t(key)
  }

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
          <p className="text-gray-500 dark:text-gray-400 font-['Nunito'] mt-2">
            {lang === 'es' 
              ? `${filtered.length} productos disponibles` 
              : `${filtered.length} products available`}
          </p>
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
                onOpenModal={(p, idx) => setModalProduct({ product: p, imgIndex: idx })}
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
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  )
}

/* ─── Individual Product Card with Multi-Image Carousel ─── */
function ProductCard({
  product,
  index,
  lang,
  getBadgeLabel,
  openWhatsApp,
  onOpenModal,
}: {
  product: Product
  index: number
  lang: 'es' | 'en'
  getBadgeLabel: (badge: string | null) => string | null
  openWhatsApp: (title: string, price: number) => void
  onOpenModal: (product: Product, initialImgIndex: number) => void
}) {
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const images = getProductImages(product)
  const currentImage = images[activeImgIndex] || product.image_url
  const title = lang === 'es' ? product.title_es : product.title_en
  const desc = lang === 'es' ? product.description_es : product.description_en

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  return (
    <div
      onClick={() => onOpenModal(product, activeImgIndex)}
      className="card-hover group relative bg-white dark:bg-[#2a2430] rounded-2xl overflow-hidden border border-pink-100/50 dark:border-purple-800/30 shadow-sm animate-fade-in-up flex flex-col cursor-pointer"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-[#1a1520] dark:to-[#251f2e]">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Carousel arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white/90 dark:bg-black/70 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-black shadow-md backdrop-blur-sm transition-all hover:scale-110"
              title="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white/90 dark:bg-black/70 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-black shadow-md backdrop-blur-sm transition-all hover:scale-110"
              title="Siguiente foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImgIndex(idx)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeImgIndex === idx
                    ? 'w-5 bg-pink-500 shadow-md'
                    : 'w-2 bg-white/80 dark:bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* Counter badge (e.g. 1/3) */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white font-['Nunito'] z-10">
            {activeImgIndex + 1}/{images.length}
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold font-['Nunito'] shadow-md backdrop-blur-sm z-10 ${
              BADGE_STYLES[product.badge] || BADGE_STYLES['new']
            }`}
          >
            {getBadgeLabel(product.badge)}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-4 py-2 bg-gray-800/90 text-white text-sm font-bold rounded-full font-['Nunito']">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-['Quicksand'] font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors duration-300">
            {title}
          </h3>
          {desc && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-['Nunito'] mb-3 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-extrabold text-gradient font-['Quicksand']">
            ${product.price.toFixed(2)}
          </span>
          {product.in_stock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openWhatsApp(title, product.price)
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-xs font-bold rounded-full shadow-md shadow-green-200/40 dark:shadow-green-900/30 hover:shadow-lg hover:scale-105 transition-all duration-300 font-['Nunito'] btn-press"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Pedir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Modal to view full details and all photos ─── */
function ProductDetailModal({
  product,
  initialImgIndex,
  lang,
  getBadgeLabel,
  openWhatsApp,
  onClose,
}: {
  product: Product
  initialImgIndex: number
  lang: 'es' | 'en'
  getBadgeLabel: (badge: string | null) => string | null
  openWhatsApp: (title: string, price: number) => void
  onClose: () => void
}) {
  const images = getProductImages(product)
  const [currentIdx, setCurrentIdx] = useState(initialImgIndex)
  const title = lang === 'es' ? product.title_es : product.title_en
  const desc = lang === 'es' ? product.description_es : product.description_en
  const currentImage = images[currentIdx] || product.image_url

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#2a2430] border border-pink-100/50 dark:border-purple-800/30 overflow-hidden shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-black/60 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photos column */}
          <div className="p-6 bg-pink-50/40 dark:bg-[#1f1b24] flex flex-col justify-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border border-pink-100 dark:border-purple-800/30 shadow-sm">
              <img src={currentImage} alt={title} className="w-full h-full object-cover" />
              {product.badge && (
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold font-['Nunito'] shadow-md backdrop-blur-sm ${
                    BADGE_STYLES[product.badge] || BADGE_STYLES['new']
                  }`}
                >
                  {getBadgeLabel(product.badge)}
                </div>
              )}
            </div>

            {/* Thumbnail row if > 1 image */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentIdx === idx
                        ? 'border-pink-500 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-gray-800 dark:text-gray-100 mb-3">
                {title}
              </h2>
              <div className="text-2xl font-black text-gradient font-['Quicksand'] mb-4">
                ${product.price.toFixed(2)}
              </div>
              {desc && (
                <p className="text-sm text-gray-600 dark:text-gray-300 font-['Nunito'] leading-relaxed mb-6 whitespace-pre-line">
                  {desc}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-pink-100 dark:border-purple-800/30">
              {product.in_stock ? (
                <button
                  onClick={() => openWhatsApp(title, product.price)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200/40 dark:shadow-green-900/30 transition-all font-['Nunito'] btn-press text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  Pedir por WhatsApp
                </button>
              ) : (
                <div className="w-full py-3 text-center text-sm font-bold text-gray-400 dark:text-gray-500 font-['Nunito'] bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  Producto Agotado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

