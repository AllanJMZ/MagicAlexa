import { useState, useEffect } from 'react'
import { MessageCircle, Share2, X } from 'lucide-react'
import { getProductImages, type Product } from '../types'
import { WHATSAPP_NUMBER } from '../lib/supabase'
import { recordProductView } from '../hooks/useProductViews'
import ShareProductModal from './ShareProductModal'

interface ProductDetailModalProps {
  product: Product
  initialImgIndex?: number
  lang: 'es' | 'en'
  getBadgeLabel?: (badge: string | null) => string | null
  openWhatsApp?: (title: string, price: number) => void
  onClose: () => void
}

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-[#10b981] text-white',
  last: 'bg-[#f59e0b] text-white',
  sold_out: 'bg-[#6b7280] text-white',
  exclusive: 'bg-[#8b5cf6] text-white',
}

export default function ProductDetailModal({
  product,
  initialImgIndex = 0,
  lang,
  getBadgeLabel,
  openWhatsApp,
  onClose,
}: ProductDetailModalProps) {
  const images = getProductImages(product)
  const [currentIdx, setCurrentIdx] = useState(initialImgIndex)
  const [shareOpen, setShareOpen] = useState(false)
  const title = lang === 'es' ? product.title_es : product.title_en
  const desc = lang === 'es' ? product.description_es : product.description_en
  const currentImage = images[currentIdx] || product.image_url

  useEffect(() => {
    recordProductView(product.id)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product.id, onClose])

  const handleOrder = () => {
    if (openWhatsApp) {
      openWhatsApp(title, product.price)
    } else {
      const msg =
        lang === 'es'
          ? `¡Hola! Me interesa comprar "${title}" ($${product.price.toFixed(2)}). ¿Está disponible? ✨`
          : `Hi! I would like to purchase "${title}" ($${product.price.toFixed(2)}). Is it available? ✨`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    }
  }

  const badgeText = getBadgeLabel ? getBadgeLabel(product.badge) : product.badge === 'new' ? 'Nuevo' : product.badge

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-modal-backdrop"
      onClick={onClose}
    >
      {/* Botón de cierre flotante fijo en la esquina superior de la pantalla (siempre visible en móviles) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[110] p-2.5 sm:p-3 rounded-full bg-white/95 dark:bg-[#251f2d]/95 text-gray-800 dark:text-gray-100 border-2 border-pink-200 dark:border-purple-700 shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
        aria-label="Cerrar producto"
        title="Cerrar (Esc)"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#2a2430] border-2 border-pink-100 dark:border-purple-800/40 overflow-hidden shadow-2xl animate-modal-content"
      >
        {/* Botón de cierre interno dentro de la tarjeta */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 dark:bg-[#1f1b24]/90 text-gray-800 dark:text-gray-100 border border-pink-200 dark:border-purple-700 hover:bg-white dark:hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer"
          aria-label="Cerrar producto"
          title="Cerrar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Contenido con scroll interno para que nunca se desborde en pantallas pequeñas */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photos column */}
          <div className="p-6 bg-pink-50/40 dark:bg-[#1f1b24] flex flex-col justify-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border border-pink-100 dark:border-purple-800/30 shadow-sm bg-gray-100 dark:bg-gray-800">
              <img
                src={currentImage}
                alt={title}
                className="w-full h-full object-cover"
                decoding="async"
              />
              {product.badge && (
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold font-['Nunito'] shadow-md backdrop-blur-sm ${
                    BADGE_STYLES[product.badge] || BADGE_STYLES['new']
                  }`}
                >
                  {badgeText}
                </div>
              )}
            </div>

            {/* Thumbnail row if > 1 image */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentIdx === idx
                        ? 'border-pink-500 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-gray-800 dark:text-gray-100 mb-2">
                {title}
              </h2>
              <div className="text-2xl font-black text-[#581566] dark:text-pink-300 font-['Quicksand'] mb-4">
                ${product.price.toFixed(2)}
              </div>
              {desc && (
                <p className="text-sm text-gray-600 dark:text-gray-300 font-['Nunito'] leading-relaxed mb-6 whitespace-pre-line">
                  {desc}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-pink-100 dark:border-purple-800/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {product.in_stock ? (
                <button
                  onClick={handleOrder}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold rounded-2xl shadow-lg transition-all font-['Nunito'] text-sm sm:text-base cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>¡Lo quiero por WhatsApp!</span>
                </button>
              ) : (
                <div className="flex-1 py-3 text-center text-sm font-bold text-gray-400 dark:text-gray-500 font-['Nunito'] bg-gray-100 dark:bg-gray-800 rounded-2xl">
                  {lang === 'es' ? 'Producto Agotado' : 'Out of Stock'}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-pink-50 hover:bg-pink-100 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-pink-600 dark:text-pink-300 font-bold rounded-2xl border border-pink-200/80 dark:border-purple-700/60 transition-all active:scale-95 font-['Nunito'] text-sm sm:text-base cursor-pointer shadow-sm hover:shadow"
                title={lang === 'es' ? 'Compartir este producto' : 'Share this product'}
              >
                <Share2 className="w-5 h-5" />
                <span>{lang === 'es' ? 'Compartir' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Product Modal */}
      {shareOpen && (
        <ShareProductModal
          product={product}
          lang={lang}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  </div>
  )
}
