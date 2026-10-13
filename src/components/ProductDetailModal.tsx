import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { getProductImages, type Product } from '../types'
import { WHATSAPP_NUMBER } from '../lib/supabase'
import { useProductViews } from '../hooks/useProductViews'

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
  const { recordView } = useProductViews()
  const title = lang === 'es' ? product.title_es : product.title_en
  const desc = lang === 'es' ? product.description_es : product.description_en
  const currentImage = images[currentIdx] || product.image_url

  useEffect(() => {
    recordView(product.id)
  }, [product.id])

  const handleOrder = () => {
    recordView(product.id)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
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
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
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

            <div className="pt-4 border-t border-pink-100 dark:border-purple-800/30">
              {product.in_stock ? (
                <button
                  onClick={handleOrder}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold rounded-2xl shadow-lg transition-all font-['Nunito'] text-base"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  ¡Lo quiero por WhatsApp!
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
