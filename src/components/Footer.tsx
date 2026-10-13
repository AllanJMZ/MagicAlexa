import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, SOCIAL_LINKS } from './SocialIcons'
import { useReveal } from '../hooks/useAnimations'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const reveal = useReveal(0.1)

  return (
    <footer className="relative mt-auto bg-gradient-to-t from-pink-50 via-white to-transparent dark:from-[#1a1520] dark:via-[#1F1B24] dark:to-transparent border-t border-pink-100/50 dark:border-purple-900/30">
      {/* Decorative wave */}
      <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-300 dark:via-purple-500 to-transparent" />

      <div
        ref={reveal.ref}
        className={`max-w-7xl mx-auto px-4 py-8 sm:py-10 reveal ${reveal.revealed ? 'revealed' : ''}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-['Nunito']">
            <span>© {year} MagicAlexa Shop.</span>
            <span>{t('footer_rights')}.</span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white dark:bg-[#2a2430] shadow-sm border border-pink-100 dark:border-purple-800/50 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-200 dark:hover:border-blue-800/50 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Facebook"
              title="Facebook @MagicCalexaBolishop"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white dark:bg-[#2a2430] shadow-sm border border-pink-100 dark:border-purple-800/50 text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 dark:hover:border-pink-800/50 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Instagram"
              title="Instagram @magiccalexa_bolishop"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white dark:bg-[#2a2430] shadow-sm border border-pink-100 dark:border-purple-800/50 text-gray-500 dark:text-gray-400 hover:text-green-500 hover:border-green-200 dark:hover:border-green-800/50 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Comunidad WhatsApp"
              title="Comunidad en WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Love note */}
          <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 font-['Nunito']">
            <span>{t('footer_made')}</span>
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
            <span>{t('footer_pusheen')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
