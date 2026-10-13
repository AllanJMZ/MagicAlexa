import { useEffect, useState } from 'react'

export interface SiteBackgroundConfig {
  bgUrl: string
  bgRepeat: boolean
  bgOpacity: number
  bgActive: boolean
}

const STORAGE_KEY = 'magic_site_background'
const EVENT_NAME = 'magic_background_updated'

export const DEFAULT_BACKGROUND: SiteBackgroundConfig = {
  bgUrl: '/bg-halloween.jpg',
  bgRepeat: true,
  bgOpacity: 0.5,
  bgActive: true,
}

export function useSiteBackground() {
  const [config, setConfigState] = useState<SiteBackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_BACKGROUND, ...JSON.parse(saved) }
      }
    } catch {
      // fallback
    }
    return DEFAULT_BACKGROUND
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          setConfigState({ ...DEFAULT_BACKGROUND, ...JSON.parse(saved) })
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

  const saveConfig = (newConfig: Partial<SiteBackgroundConfig>) => {
    const updated = { ...config, ...newConfig }
    setConfigState(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
      // ignore
    }
  }

  return {
    ...config,
    saveConfig,
  }
}
