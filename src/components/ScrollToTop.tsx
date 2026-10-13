import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Ir al inicio"
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-xl shadow-pink-300/40 dark:shadow-purple-900/40 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group animate-fade-in"
      title="Volver arriba"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200 stroke-[2.5]" />
    </button>
  )
}
