import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, SOCIAL_LINKS } from './SocialIcons'
import { useReveal } from '../hooks/useAnimations'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const reveal = useReveal(0.1)

  return (
    <footer className="relative mt-auto bg-white dark:bg-[#121214] border-t border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-300">
      <div
        ref={reveal.ref}
        className={`max-w-7xl mx-auto px-4 py-8 sm:py-10 reveal ${reveal.revealed ? 'revealed' : ''}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-['Nunito']">
            <span>
              © {year} MagicCalexa Shop
              <Link
                to="/admin"
                aria-label="Acceso"
                className="text-inherit hover:text-inherit cursor-default select-none ml-0.5 focus:outline-none"
                tabIndex={-1}
              >
                .
              </Link>
            </span>
            <span>{t('footer_rights')}.</span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gray-50 dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Facebook"
              title="Facebook @MagicCalexaBolishop"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gray-50 dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:text-pink-500 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Instagram"
              title="Instagram @magiccalexa_bolishop"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={SOCIAL_LINKS.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-gray-50 dark:bg-neutral-800 shadow-sm border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:text-green-500 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md hover:scale-110 transition-all duration-300"
              aria-label="Comunidad WhatsApp"
              title="Comunidad en WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Love note */}
          <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 font-['Nunito']">
            <span>{t('footer_made')}</span>
            <Link
              to="/admin"
              aria-label="Admin"
              className="inline-flex items-center focus:outline-none transition-transform hover:scale-125"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
            </Link>
            <span>{t('footer_pusheen')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
