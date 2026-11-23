import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../hooks/useSupabase'
import { ExternalLink, Sparkles } from 'lucide-react'

export default function Banner() {
  const { i18n } = useTranslation()
  const { settings } = useSiteSettings()

  if (!settings || !settings.banner_active) return null

  const text = i18n.language === 'es' ? settings.banner_text_es : settings.banner_text_en

  return (
    <div className="relative z-40 bg-neutral-900 dark:bg-black text-white border-b border-neutral-800">
      <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-amber-200 animate-pulse shrink-0" />
        {settings.banner_link ? (
          <a
            href={settings.banner_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-neutral-100 hover:text-white font-['Nunito'] hover:underline flex items-center gap-1 transition-colors"
          >
            {text}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs sm:text-sm font-semibold text-neutral-100 font-['Nunito']">
            {text}
          </span>
        )}
        <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-amber-200 animate-pulse shrink-0" />
      </div>
    </div>
  )
}
