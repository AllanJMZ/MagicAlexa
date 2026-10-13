import { useEffect, useRef, useState } from 'react'

/**
 * Hook that observes when an element enters the viewport
 * and triggers a reveal animation class.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, revealed }
}

/**
 * Hook that tracks scroll progress (0 to 1)
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0
      setProgress(Math.min(scrolled, 1))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

/**
 * Hook that returns true once the component has mounted
 * Useful for triggering entrance animations.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Small delay to allow the component to render first
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])
  return mounted
}
