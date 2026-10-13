import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'magic_product_views'
const EVENT_NAME = 'magic_product_views_updated'

export function useProductViews() {
  const [viewsMap, setViewsMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return {}
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          setViewsMap(JSON.parse(saved))
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

  // Increment view count for a product
  const recordView = async (productId: string) => {
    if (!productId) return

    // 1. Update in local storage state
    let updatedCount = 1
    setViewsMap((prev) => {
      const current = prev[productId] || 0
      updatedCount = current + 1
      const nextMap = { ...prev, [productId]: updatedCount }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMap))
        window.dispatchEvent(new Event(EVENT_NAME))
      } catch {
        // ignore
      }
      return nextMap
    })

    // 2. Safely attempt to increment in Supabase if column exists
    try {
      // Fire-and-forget update to Supabase products table (if views column exists)
      await supabase
        .from('products')
        .update({ views: updatedCount })
        .eq('id', productId)
    } catch {
      // silently ignore if column does not exist
    }
  }

  const getViewCount = (productId: string): number => {
    return viewsMap[productId] || 0
  }

  const getTotalViews = (): number => {
    return Object.values(viewsMap).reduce((acc, curr) => acc + curr, 0)
  }

  const getTopViewedProducts = (
    products: Product[],
    limit = 5
  ): { product: Product; views: number }[] => {
    return products
      .map((p) => ({
        product: p,
        views: viewsMap[p.id] || (p.views ?? 0),
      }))
      .filter((item) => item.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  const resetAllViews = () => {
    if (confirm('¿Estás seguro de reiniciar todos los contadores de vistas a 0?')) {
      setViewsMap({})
      try {
        localStorage.removeItem(STORAGE_KEY)
        window.dispatchEvent(new Event(EVENT_NAME))
      } catch {
        // ignore
      }
    }
  }

  return {
    viewsMap,
    recordView,
    getViewCount,
    getTotalViews,
    getTopViewedProducts,
    resetAllViews,
  }
}
