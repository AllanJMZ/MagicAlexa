import { useTranslation } from 'react-i18next'
import { useShippingMethods } from '../hooks/useSupabase'
import { useReveal } from '../hooks/useAnimations'
import { Clock, DollarSign, Package, Truck } from 'lucide-react'

const ICONS = [
  <Truck className="w-6 h-6" />,
  <Package className="w-6 h-6" />,
  <Clock className="w-6 h-6" />,
]

const COLORS = [
  { gradient: 'from-pink-400 to-rose-400', bg: 'bg-pink-50 dark:bg-pink-900/15', border: 'border-pink-200/50 dark:border-pink-800/30', accent: 'text-pink-500' },
  { gradient: 'from-purple-400 to-indigo-400', bg: 'bg-purple-50 dark:bg-purple-900/15', border: 'border-purple-200/50 dark:border-purple-800/30', accent: 'text-purple-500' },
  { gradient: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50 dark:bg-emerald-900/15', border: 'border-emerald-200/50 dark:border-emerald-800/30', accent: 'text-emerald-500' },
  { gradient: 'from-amber-400 to-orange-400', bg: 'bg-amber-50 dark:bg-amber-900/15', border: 'border-amber-200/50 dark:border-amber-800/30', accent: 'text-amber-500' },
]

export default function Shipping() {
  const { t, i18n } = useTranslation()
  const { methods, loading } = useShippingMethods()
  const lang = i18n.language as 'es' | 'en'
  const headerReveal = useReveal(0.1)
  const cardsReveal = useReveal(0.05)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-200 dark:border-pink-800 border-t-pink-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div
          ref={headerReveal.ref}
          className={`text-center mb-12 reveal ${headerReveal.revealed ? 'revealed' : ''}`}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Truck className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold font-['Quicksand'] text-gradient">
              {t('shipping_title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-['Nunito'] max-w-lg mx-auto">
            {t('shipping_subtitle')}
          </p>
        </div>

        {/* Methods */}
        {methods.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="inline-flex p-6 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-4">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-['Nunito'] text-lg">
              {t('shipping_empty')}
            </p>
          </div>
        ) : (
          <div
            ref={cardsReveal.ref}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
          >
            {methods.map((method, i) => {
              const color = COLORS[i % COLORS.length]
              const icon = ICONS[i % ICONS.length]
              const title = lang === 'es' ? method.title_es : method.title_en
              const desc = lang === 'es' ? method.description_es : method.description_en

              return (
                <div
                  key={method.id}
                  className={`card-hover ${color.bg} rounded-2xl p-6 sm:p-8 border ${color.border} group`}
                  style={{ 
                    animationDelay: `${i * 150}ms`
                  }}
                >
                  <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${color.gradient} text-white mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {icon}
                  </div>
                  <h3 className="font-['Quicksand'] font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-['Nunito'] mb-5 leading-relaxed">
                      {desc}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {method.cost_note && (
                      <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/70 dark:bg-black/20 text-xs font-semibold text-gray-700 dark:text-gray-300 font-['Nunito'] border border-white/30 dark:border-gray-700/30 shadow-sm">
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
                        {t('shipping_cost')}: {method.cost_note}
                      </div>
                    )}
                    {method.delivery_time && (
                      <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/70 dark:bg-black/20 text-xs font-semibold text-gray-700 dark:text-gray-300 font-['Nunito'] border border-white/30 dark:border-gray-700/30 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {t('shipping_time')}: {method.delivery_time}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
