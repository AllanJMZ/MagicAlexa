import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Package, ShieldCheck, Sparkles, Star, Truck, Zap } from 'lucide-react'
import { useReveal, useMounted } from '../hooks/useAnimations'
import { useProducts, useSiteSettings } from '../hooks/useSupabase'
import { useFeaturedProducts } from '../hooks/useFeaturedProducts'
import type { Product } from '../types'
import AnimatedStar from '../components/AnimatedStar'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, SOCIAL_LINKS } from '../components/SocialIcons'

export default function Home() {
  const { t, i18n } = useTranslation()
  const mounted = useMounted()
  const { products } = useProducts()
  const { settings } = useSiteSettings()
  const { getFeaturedProducts } = useFeaturedProducts()
  const featuredProducts = getFeaturedProducts(products)
  const [modalProduct, setModalProduct] = useState<{ product: Product; imgIndex: number } | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const lang = i18n.language as 'es' | 'en'

  // Local fallback if saved in admin
  const localSeasonal = (() => {
    try {
      return JSON.parse(localStorage.getItem('magic_season_settings') || '{}')
    } catch {
      return {}
    }
  })()

  const seasonImage = settings?.season_image_url || localSeasonal.season_image_url || './season-image.jpg'
  const seasonTitle = (lang === 'en' ? settings?.season_title_en : settings?.season_title_es)
    || (lang === 'en' ? localSeasonal.season_title_en : localSeasonal.season_title_es)
    || (lang === 'es' ? '✨ Temporada Otoño 2026' : '✨ Autumn Season 2026')
  const seasonDesc = (lang === 'en' ? settings?.season_desc_en : settings?.season_desc_es)
    || (lang === 'en' ? localSeasonal.season_desc_en : localSeasonal.season_desc_es)
    || (lang === 'es' ? 'Nuevas piezas de la colección de temporada ya disponibles 🍂' : 'New seasonal collection pieces now available 🍂')

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
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-900/10 rounded-full blur-3xl animate-float" />
        </div>

        {/* Floating sparkles */}
        <div className="absolute top-20 left-[8%] animate-float">
          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 opacity-60" />
        </div>
        <div className="absolute top-32 right-[10%] animate-float-delayed">
          <Sparkles className="w-5 h-5 text-pink-300 opacity-50" />
        </div>
        <div className="absolute bottom-20 left-[15%] animate-float">
          <Heart className="w-4 h-4 text-pink-300 fill-pink-300 opacity-40" />
        </div>
        <div className="absolute bottom-32 right-[20%] animate-float-delayed">
          <Star className="w-3 h-3 text-purple-300 fill-purple-300 opacity-50" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Hero Text & Star */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border border-pink-200/50 dark:border-purple-700/50 transition-all duration-700 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-xs font-semibold text-pink-600 dark:text-pink-300 font-['Nunito']">
                  ✨ Kawaii Collection
                </span>
              </div>

              {/* Animated Star & Decorative Header */}
              <div
                className={`flex items-center justify-center lg:justify-start gap-4 mb-4 transition-all duration-700 ${
                  mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <AnimatedStar />
                <span className="text-3xl select-none animate-bounce-gentle">🐱</span>
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
                className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-['Nunito'] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed transition-all duration-700 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                {t('hero_subtitle')}
              </p>

              <div
                className={`flex flex-wrap items-center justify-center lg:justify-start gap-4 transition-all duration-700 ${
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
                <Link
                  to="/shipping"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-full border-2 border-pink-200 dark:border-purple-700/50 text-gray-700 dark:text-gray-200 font-bold font-['Nunito'] hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all duration-300"
                >
                  <Truck className="w-5 h-5 text-purple-400" />
                  {t('nav_shipping')}
                </Link>
              </div>

              {/* Floating paw prints */}
              <div
                className={`mt-10 flex justify-center lg:justify-start gap-3 transition-all duration-700 ${
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

            {/* Right Column: Seasonal Feature Card */}
            <div
              className={`lg:col-span-5 transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="relative mx-auto max-w-md lg:max-w-none group">
                {/* Glow backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/30 to-purple-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-pink-100/60 dark:border-purple-800/40 min-h-[400px] sm:min-h-[460px] flex flex-col justify-end bg-[#2a2430]">
                  <img
                    src={seasonImage}
                    alt="Decoración de temporada"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-pink-950/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent" />

                  {/* Floating stars on the card */}
                  <div className="absolute top-6 right-6 animate-float">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 opacity-90 drop-shadow-md" />
                  </div>
                  <div className="absolute top-16 left-8 animate-float-delayed">
                    <Star className="w-4 h-4 text-pink-300 fill-pink-300 opacity-80 drop-shadow-md" />
                  </div>
                  <div className="absolute top-28 right-12 animate-float">
                    <Sparkles className="w-4 h-4 text-yellow-200 opacity-70" />
                  </div>

                  {/* Card footer description */}
                  <div className="relative z-10 p-6 sm:p-8 text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-3 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      <span className="text-xs font-bold font-['Nunito'] uppercase tracking-wider text-pink-100">
                        {seasonTitle}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-['Quicksand'] mb-2 text-white drop-shadow">
                      {lang === 'es' ? 'Colección de Temporada' : 'Seasonal Collection'}
                    </h3>

                    <p className="text-sm font-['Nunito'] text-white/90 leading-relaxed drop-shadow">
                      {seasonDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mini Carrusel de Artículos Destacados (Hasta 10 artículos) */}
      {featuredProducts.length > 0 && (
        <section className="py-8 sm:py-14 bg-gradient-to-b from-transparent via-pink-50/40 dark:via-purple-950/20 to-transparent">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-purple-900/40 text-pink-600 dark:text-pink-300 text-xs font-bold font-['Nunito'] mb-2 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  {lang === 'es' ? 'Colección Especial' : 'Special Selection'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-gradient">
                  {lang === 'es' ? 'Artículos Destacados' : 'Featured Products'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-['Nunito'] mt-1">
                  {lang === 'es'
                    ? 'Los favoritos más pedidos seleccionados para ti 💖'
                    : 'The most popular favorites handpicked for you 💖'}
                </p>
              </div>

              {/* Controls and Link */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link
                  to="/catalog"
                  className="text-xs sm:text-sm font-bold text-pink-500 hover:text-pink-600 dark:text-pink-400 font-['Nunito'] flex items-center gap-1 transition-colors mr-2"
                >
                  {lang === 'es' ? 'Ver todo el catálogo' : 'View all'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#251f2d] border border-pink-200 dark:border-purple-800/40 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-purple-900/30 shadow-sm transition-all hover:scale-105 active:scale-95"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#251f2d] border border-pink-200 dark:border-purple-800/40 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-purple-900/30 shadow-sm transition-all hover:scale-105 active:scale-95"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="w-[230px] sm:w-[260px] flex-shrink-0 snap-start flex flex-col"
                >
                  <ProductCard
                    product={p}
                    index={idx}
                    lang={lang}
                    onOpenModal={(prod, imgIdx) => setModalProduct({ product: prod, imgIndex: imgIdx })}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal if opened from home carousel */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct.product}
          initialImgIndex={modalProduct.imgIndex}
          lang={lang}
          onClose={() => setModalProduct(null)}
        />
      )}

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

      {/* Redes Sociales y Comunidad Section */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-pink-50/90 via-purple-50/70 to-pink-50/90 dark:from-[#251d2e] dark:via-[#1e1924] dark:to-[#221a28] border border-pink-200/80 dark:border-purple-800/40 text-center shadow-sm">
            <span className="text-3xl select-none mb-2 inline-block">💖</span>
            <h2 className="font-['Quicksand'] font-bold text-xl sm:text-2xl text-gray-800 dark:text-gray-100 mb-2">
              {lang === 'es' ? '¡Síguenos y Únete a la Comunidad!' : 'Follow Us & Join the Community!'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-['Nunito'] max-w-md mx-auto mb-6">
              {lang === 'es'
                ? 'Conoce lanzamientos antes que nadie, dinámicas especiales y únete a nuestro grupo oficial en WhatsApp ✨'
                : 'Discover releases before anyone else, special giveaways and join our official WhatsApp group ✨'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm font-['Nunito'] shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs sm:text-sm font-['Nunito'] shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {lang === 'es' ? 'Grupo de WhatsApp' : 'WhatsApp Community'}
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm font-['Nunito'] shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <FacebookIcon className="w-4 h-4" />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
