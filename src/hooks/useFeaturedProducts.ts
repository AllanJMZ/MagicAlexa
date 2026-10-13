import { useEffect, useState } from 'react'
import type { Product } from '../types'

const STORAGE_KEY = 'magic_featured_product_ids'
const EVENT_NAME = 'magic_featured_products_updated'

export function useFeaturedProducts() {
  const [featuredIds, setFeaturedIdsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed.slice(0, 10)
      }
    } catch {
      // ignore
    }
    return []
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setFeaturedIdsState(parsed.slice(0, 10))
          }
        } else {
          setFeaturedIdsState([])
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const saveIds = (ids: string[]) => {
    const capped = ids.slice(0, 10)
    setFeaturedIdsState(capped)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped))
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
      // ignore
    }
  }

  const isFeatured = (id: string) => featuredIds.includes(id)

  const toggleFeatured = (id: string): { success: boolean; message?: string } => {
    if (featuredIds.includes(id)) {
      saveIds(featuredIds.filter((itemId) => itemId !== id))
      return { success: true }
    } else {
      if (featuredIds.length >= 10) {
        return {
          success: false,
          message: 'Solo puedes seleccionar un máximo de 10 artículos para el carrusel de inicio.',
        }
      }
      saveIds([...featuredIds, id])
      return { success: true }
    }
  }

  const getFeaturedProducts = (allProducts: Product[]): Product[] => {
    if (featuredIds.length > 0) {
      const selected = allProducts.filter((p) => featuredIds.includes(p.id))
      if (selected.length > 0) return selected.slice(0, 10)
    }
    // Fallback: If no products selected yet, return the first 10 products
    return allProducts.slice(0, 10)
  }

  return {
    featuredIds,
    isFeatured,
    toggleFeatured,
    setFeaturedIds: saveIds,
    getFeaturedProducts,
  }
}
