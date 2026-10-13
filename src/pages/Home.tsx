import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Package, ShieldCheck, Sparkles, Star, Truck, Zap } from 'lucide-react'
import { useReveal, useMounted } from '../hooks/useAnimations'
import { useProducts } from '../hooks/useSupabase'

export default function Home() {
  const { t, i18n } = useTranslation()
  const mounted = useMounted()
  const { products } = useProducts()
  const lang = i18n.language as 'es' | 'en'

  const featuresReveal = useReveal(0.1)
  const ctaReveal = useReveal(0.15)
  const statsReveal = useReveal(0.1)

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: { es: '100% Originales', en: '100% Original' },
      desc: { es: 'Productos auténticos y de la más alta calidad', en: 'Authentic products of the highest quality' },
      color: 'from-pink-400 to-rose-400',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: { es: 'Envíos Seguros', en: 'Safe Shipping' },
      desc: { es: 'Empacamos con amor a todo el país', en: 'We pack with love, nationwide delivery' },
      color: 'from-purple-400 to-indigo-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: { es: 'Compra Segura', en: 'Secure Purchase' },
      desc: { es: 'Atención personalizada por WhatsApp', en: 'Personalized attention via WhatsApp' },
      color: 'from-emerald-400 to-teal-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ]

  const stats = [
    { value: products.length || '50+', label: { es: 'Productos', en: 'Products' }, icon: <Package className="w-5 h-5" /> },
    { value: '⭐ 5.0', label: { es: 'Calificación', en: 'Rating' }, icon: <Star className="w-5 h-5" /> },
    { value: '24h', label: { es: 'Respuesta', en: 'Response' }, icon: <Zap className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-900/10 rounded-full blur-3xl animate-float" />
        </div>

        {/* Floating sparkles */}
        <div className="absolute top-20 left-[10%] animate-float">
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 opacity-60" />
        </div>
        <div className="absolute top-32 right-[15%] animate-float-delayed">
          <Sparkles className="w-5 h-5 text-pink-300 opacity-50" />
        </div>
        <div className="absolute bottom-20 left-[20%] animate-float">
          <Heart className="w-4 h-4 text-pink-300 fill-pink-300 opacity-40" />
        </div>
        <div className="absolute bottom-32 right-[25%] animate-float-delayed">
          <Star className="w-3 h-3 text-purple-300 fill-purple-300 opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border border-pink-200/50 dark:border-purple-700/50 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-300 font-['Nunito']">
              ✨ Kawaii Collection
            </span>
          </div>

          {/* Cat face deco */}
          <div
            className={`mb-6 text-7xl sm:text-8xl select-none transition-all duration-1000 ${
              mounted ? 'opacity-100 scale-100 animate-bounce-gentle' : 'opacity-0 scale-50'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            🐱
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold font-['Quicksand'] mb-6 leading-tight transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <span className="text-gradient">
              {t('hero_title')}
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-['Nunito'] max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {t('hero_subtitle')}
          </p>

          <div
            className={`transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <Link
              to="/catalog"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold rounded-full shadow-lg shadow-pink-300/30 dark:shadow-pink-900/30 hover:shadow-xl hover:shadow-pink-300/40 dark:hover:shadow-pink-900/40 transition-all duration-300 hover:scale-105 font-['Nunito'] text-lg btn-press animate-glow"
            >
              {t('hero_cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Floating paw prints */}
          <div
            className={`mt-14 flex justify-center gap-3 transition-all duration-700 ${
              mounted ? 'opacity-30 dark:opacity-20' : 'opacity-0'
            }`}
            style={{ transitionDelay: '1000ms' }}
          >
            {['🐾', '🐾', '🐾', '🐾', '🐾'].map((p, i) => (
              <span key={i} className="text-2xl animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-4 sm:py-8">
        <div
          ref={statsReveal.ref}
          className={`max-w-3xl mx-auto px-4 reveal ${statsReveal.revealed ? 'revealed' : ''}`}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-[#2a2430]/60 backdrop-blur-sm border border-pink-100/50 dark:border-purple-800/30 transition-all duration-500 hover:scale-105 stagger-${i + 1}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-500 dark:text-pink-300 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-['Nunito'] font-semibold">
                  {stat.label[lang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16">
        <div
          ref={featuresReveal.ref}
          className={`max-w-6xl mx-auto px-4 reveal ${featuresReveal.revealed ? 'revealed' : ''}`}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-gradient mb-3">
              {lang === 'es' ? '¿Por qué elegirnos?' : 'Why choose us?'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-['Nunito'] max-w-md mx-auto">
              {lang === 'es'
                ? 'Te damos razones para confiar en tu compra ✨'
                : 'We give you reasons to trust your purchase ✨'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`card-hover ${f.bg} rounded-2xl p-6 sm:p-8 border border-white/50 dark:border-purple-800/30 group`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${f.color} text-white mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {f.icon}
                </div>
                <h3 className="font-['Quicksand'] font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">
                  {f.title[lang]}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-['Nunito'] leading-relaxed">
                  {f.desc[lang]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div
          ref={ctaReveal.ref}
          className={`max-w-4xl mx-auto px-4 reveal-scale ${ctaReveal.revealed ? 'revealed' : ''}`}
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 p-px animate-glow">
            <div className="rounded-3xl bg-white dark:bg-[#1F1B24] p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Background sparkle */}
              <div className="absolute top-4 right-8 animate-float opacity-20">
                <Sparkles className="w-8 h-8 text-purple-300" />
              </div>
              <div className="absolute bottom-6 left-10 animate-float-delayed opacity-15">
                <Star className="w-6 h-6 text-pink-300 fill-pink-300" />
              </div>

              <Package className="w-14 h-14 mx-auto mb-5 text-purple-400 animate-bounce-gentle" />
              <h2 className="font-['Quicksand'] font-bold text-2xl sm:text-3xl text-gray-800 dark:text-gray-100 mb-3">
                {features[1].title[lang]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-['Nunito'] mb-8 max-w-lg mx-auto leading-relaxed">
                {features[1].desc[lang]}
              </p>
              <Link
                to="/shipping"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-300 font-bold font-['Nunito'] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-105 btn-press group"
              >
                {t('nav_shipping')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
