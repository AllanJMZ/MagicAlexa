import { useState, useEffect } from 'react'
import { Check, Copy, FileText, Share2, Smartphone, X } from 'lucide-react'
import type { Product } from '../types'
import { getProductImages } from '../types'
import {
  FacebookIcon,
  PinterestIcon,
  TelegramIcon,
  TwitterXIcon,
  WhatsAppIcon,
} from './SocialIcons'
import {
  getProductShareFullMessage,
  getProductShareText,
  getProductShareUrl,
} from '../lib/share'

interface ShareProductModalProps {
  product: Product | null
  lang: 'es' | 'en'
  isOpen: boolean
  onClose: () => void
}

export default function ShareProductModal({
  product,
  lang,
  isOpen,
  onClose,
}: ShareProductModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCopiedLink(false)
      setCopiedMessage(false)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const title = lang === 'es' ? product.title_es : product.title_en
  const images = getProductImages(product)
  const currentImage = images[0] || product.image_url || ''
  const shareUrl = getProductShareUrl(product.id)
  const shareText = getProductShareText(product, lang)
  const fullMessage = getProductShareFullMessage(product, lang)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = fullMessage
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2500)
    }
  }

  const handleNativeShare = async () => {
    if (!navigator.share) return
    try {
      await navigator.share({
        title: title,
        text: shareText,
        url: shareUrl,
      })
    } catch {
      // User cancelled or share failed, silent fallback
    }
  }

  const handleShareWhatsApp = () => {
    const text = `${shareText}\n${shareUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
  }

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleSharePinterest = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(
        currentImage
      )}&description=${encodeURIComponent(shareText)}`,
      '_blank'
    )
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto rounded-3xl bg-white dark:bg-[#251f2d] border-2 border-pink-200 dark:border-purple-800/40 p-5 sm:p-6 shadow-2xl transition-all animate-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-purple-900/40 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Quicksand'] font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                {lang === 'es' ? 'Compartir Producto' : 'Share Product'}
              </h3>
              <p className="font-['Nunito'] text-xs text-gray-500 dark:text-gray-400">
                {lang === 'es' ? 'Envía este lindo artículo a tus amigos' : 'Send this cute item to your friends'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-purple-900/40 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product mini-preview card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-pink-50/60 dark:bg-[#1e1925] border border-pink-100 dark:border-purple-800/30 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 border border-pink-100 dark:border-purple-800/30">
            <img src={currentImage} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-['Quicksand'] font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h4>
            <span className="font-['Quicksand'] font-black text-pink-600 dark:text-pink-300 text-sm">
              ${product.price.toFixed(2)}
            </span>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-['Nunito'] truncate mt-0.5">
              {product.in_stock
                ? lang === 'es' ? '✓ En existencia' : '✓ In stock'
                : lang === 'es' ? '✕ Agotado' : '✕ Out of stock'}
            </div>
          </div>
        </div>

        {/* Native mobile share button (if supported) */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-['Nunito'] font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'es' ? 'Compartir en mis aplicaciones' : 'Share to apps on device'}</span>
          </button>
        )}

        {/* Social channels grid */}
        <div className="mb-4">
          <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 font-['Nunito'] mb-2.5">
            {lang === 'es' ? 'Compartir directamente en:' : 'Share directly to:'}
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-center">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-green-50 dark:hover:bg-green-950/20 text-gray-700 dark:text-gray-200 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform">
                <WhatsAppIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-['Nunito'] font-semibold truncate w-full">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-700 dark:text-gray-200 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform">
                <FacebookIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-['Nunito'] font-semibold truncate w-full">Facebook</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={handleShareTelegram}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-sky-50 dark:hover:bg-sky-950/20 text-gray-700 dark:text-gray-200 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform">
                <TelegramIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-['Nunito'] font-semibold truncate w-full">Telegram</span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={handleShareTwitter}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform">
                <TwitterXIcon className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[11px] font-['Nunito'] font-semibold truncate w-full">X</span>
            </button>

            {/* Pinterest */}
            <button
              type="button"
              onClick={handleSharePinterest}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-200 transition-all group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#E60023] text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 transition-transform">
                <PinterestIcon className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-['Nunito'] font-semibold truncate w-full">Pinterest</span>
            </button>
          </div>
        </div>

        {/* Copy Link Input Section */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 font-['Nunito'] mb-1.5">
            {lang === 'es' ? 'Enlace directo al producto:' : 'Direct product link:'}
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-50 dark:bg-[#1a1620] border border-pink-100 dark:border-purple-800/40">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2.5 text-xs text-gray-600 dark:text-gray-300 font-mono outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-['Nunito'] transition-all duration-200 active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? '¡Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Copiar' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Copy Full Text Button */}
        <div>
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-['Nunito'] font-semibold transition-all ${
              copiedMessage
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'border-pink-200 dark:border-purple-800/50 hover:bg-pink-50/60 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'
            }`}
          >
            {copiedMessage ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'es' ? '¡Mensaje completo copiado!' : 'Full message copied!'}</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-pink-500" />
                <span>
                  {lang === 'es'
                    ? 'Copiar texto con detalles listo para WhatsApp o SMS'
                    : 'Copy formatted text ready for chat'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
