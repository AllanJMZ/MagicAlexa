import { useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { getProductImages, type Product } from '../types'
import { WHATSAPP_NUMBER } from '../lib/supabase'

interface ProductCardProps {
  product: Product
  index?: number
  lang: 'es' | 'en'
  getBadgeLabel?: (badge: string | null) => string | null
  openWhatsApp?: (title: string, price: number) => void
  onOpenModal?: (product: Product, initialImgIndex: number) => void
  className?: string
}

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-[#10b981] text-white', // Matching user screenshot exact turquoise green
  last: 'bg-[#f59e0b] text-white',
  sold_out: 'bg-[#6b7280] text-white',
  exclusive: 'bg-[#8b5cf6] text-white',
}

export default function ProductCard({
  product,
  index = 0,
  lang,
  getBadgeLabel,
  openWhatsApp,
  onOpenModal,
  className = '',
}: ProductCardProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const images = getProductImages(product)
  const currentImage = images[activeImgIndex] || product.image_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=500'
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

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (openWhatsApp) {
      openWhatsApp(title, product.price)
      return
    }
    const msg =
      lang === 'es'
        ? `¡Hola! Me interesa comprar "${title}" ($${product.price.toFixed(2)}). ¿Está disponible? ✨`
        : `Hi! I would like to purchase "${title}" ($${product.price.toFixed(2)}). Is it available? ✨`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const badgeText = getBadgeLabel ? getBadgeLabel(product.badge) : product.badge === 'new' ? 'Nuevo' : product.badge

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(product, activeImgIndex)}
      className={`group relative bg-white dark:bg-[#251f2d] rounded-3xl p-3 sm:p-3.5 border border-gray-100 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer ${className}`}
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {/* Image container inside padded card with rounded corners */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Carousel arrows (when 2 or 3 photos) */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-auto">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white/90 dark:bg-black/70 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-black shadow-md backdrop-blur-sm transition-transform hover:scale-110"
              title="Foto anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white/90 dark:bg-black/70 text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-black shadow-md backdrop-blur-sm transition-transform hover:scale-110"
              title="Siguiente foto"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dots indicator for multiple photos */}
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
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImgIndex === idx
                    ? 'w-4 bg-pink-500 shadow-sm'
                    : 'w-1.5 bg-white/80 dark:bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo counter badge (e.g. 1/3) */}
        {images.length > 1 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white font-['Nunito'] z-10">
            {activeImgIndex + 1}/{images.length}
          </div>
        )}

        {/* Badge (e.g. "Nuevo" in bright turquoise green) */}
        {product.badge && (
          <div
            className={`absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-xs font-bold font-['Nunito'] shadow-sm z-10 ${
              BADGE_STYLES[product.badge] || BADGE_STYLES['new']
            }`}
          >
            {badgeText}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-3.5 py-1.5 bg-gray-900/90 text-white text-xs font-bold rounded-full font-['Nunito']">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-['Quicksand'] font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
            {title}
          </h3>
          {/* Subtitle / Description */}
          <p className="font-['Nunito'] text-sm text-gray-400 dark:text-gray-400 line-clamp-1 mt-0.5 mb-2">
            {desc || '—'}
          </p>
        </div>

        {/* Price and WhatsApp Button */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="font-['Quicksand'] font-extrabold text-lg sm:text-xl text-[#581566] dark:text-pink-300">
            ${product.price.toFixed(2)}
          </span>

          {product.in_stock && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-['Nunito'] font-bold text-xs sm:text-sm rounded-full shadow-sm hover:shadow transition-all duration-200"
              title="Pedir por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>¡Lo quiero!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
