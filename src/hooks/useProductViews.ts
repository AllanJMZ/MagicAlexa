import { useEffect, useState } from 'react'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'magic_product_views'
const EVENT_NAME = 'magic_product_views_updated'

// Cooldown to prevent duplicate calls from double clicks, modal open + card click, or React StrictMode
const lastViewTimestamps: Record<string, number> = {}

export function isUserAdmin(): boolean {
  try {
    // 1. Explicit flag saved in useAuth / admin
    if (localStorage.getItem('magic_is_admin') === 'true') {
      return true
    }

    // 2. Currently navigating in admin section
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/admin')) {
      return true
    }

    // 3. Supabase auth token stored in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const item = localStorage.getItem(key)
        if (item) {
          const parsed = JSON.parse(item)
          if (parsed?.user || parsed?.access_token) {
            return true
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return false
}

export function recordProductView(productId: string) {
  if (!productId) return

  // Do not count views if user is admin
  if (isUserAdmin()) {
    return
  }

  const now = Date.now()
  const last = lastViewTimestamps[productId] || 0
  if (now - last < 5000) {
    return
  }
  lastViewTimestamps[productId] = now

  // Process asynchronously after 800ms so it never interferes with opening modal animations
  setTimeout(async () => {
    // Extra safety check: verify active Supabase admin session
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        return
      }
    } catch {
      // ignore
    }

    if (isUserAdmin()) {
      return
    }

    let updatedCount = 1
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const currentMap: Record<string, number> = saved ? JSON.parse(saved) : {}
      updatedCount = (currentMap[productId] || 0) + 1
      currentMap[productId] = updatedCount
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMap))
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
      // ignore
    }

    try {
      const { error: rpcError } = await supabase.rpc('increment_product_views', { p_id: productId })
      if (!rpcError) return
    } catch {
      // ignore if RPC not configured yet
    }

    try {
      await supabase
        .from('products')
        .update({ views: updatedCount })
        .eq('id', productId)
    } catch {
      // silently ignore if column does not exist
    }
  }, 800)
}

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

  const recordView = (productId: string) => {
    recordProductView(productId)
  }

  const getViewCount = (productId: string, product?: Product): number => {
    const dbViews = product?.views ?? 0
    const localViews = viewsMap[productId] || 0
    return Math.max(dbViews, localViews)
  }

  const getTotalViews = (products?: Product[]): number => {
    if (products && products.length > 0) {
      return products.reduce((acc, p) => acc + Math.max(p.views ?? 0, viewsMap[p.id] || 0), 0)
    }
    return Object.values(viewsMap).reduce((acc, curr) => acc + curr, 0)
  }

  const getTopViewedProducts = (
    products: Product[],
    limit = 5
  ): { product: Product; views: number }[] => {
    return products
      .map((p) => ({
        product: p,
        views: Math.max(p.views ?? 0, viewsMap[p.id] || 0),
      }))
      .filter((item) => item.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  const resetAllViews = () => {
    if (confirm('¿Estás seguro de reiniciar todos los contadores locales de vistas a 0?')) {
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
