import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../hooks/useSupabase'
import { ExternalLink, Sparkles } from 'lucide-react'

export default function Banner() {
  const { i18n } = useTranslation()
  const { settings } = useSiteSettings()

  if (!settings || !settings.banner_active) return null

  const text = i18n.language === 'es' ? settings.banner_text_es : settings.banner_text_en

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 dark:from-pink-900/60 dark:via-purple-900/60 dark:to-pink-900/60">
      {/* Animated shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-3.5 h-3.5 text-pink-700 dark:text-pink-200 animate-pulse flex-shrink-0" />
        {settings.banner_link ? (
          <a
            href={settings.banner_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-pink-800 dark:text-pink-100 font-['Nunito'] hover:underline flex items-center gap-1"
          >
            {text}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs sm:text-sm font-semibold text-pink-800 dark:text-pink-100 font-['Nunito']">
            {text}
          </span>
        )}
        <Sparkles className="w-3.5 h-3.5 text-pink-700 dark:text-pink-200 animate-pulse flex-shrink-0" />
      </div>
    </div>
  )
}
