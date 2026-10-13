import { useEffect, useState } from 'react'

const STORAGE_KEY = 'magic_site_background_url'
const EVENT_NAME = 'magic_background_url_updated'

export const DEFAULT_BACKGROUND_URL = '/bg-halloween.jpg'

export function useSiteBackground() {
  const [bgUrl, setBgUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        return saved
      }
      // Migration from previous key if existing
      const old = localStorage.getItem('magic_site_background')
      if (old) {
        const parsed = JSON.parse(old)
        if (parsed.bgActive === false) return ''
        if (parsed.bgUrl) return parsed.bgUrl
      }
    } catch {
      // fallback
    }
    return DEFAULT_BACKGROUND_URL
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
          setBgUrlState(saved)
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

  const saveBgUrl = (url: string) => {
    setBgUrlState(url)
    try {
      localStorage.setItem(STORAGE_KEY, url)
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
      // ignore
    }
  }

  return {
    bgUrl,
    saveBgUrl,
    bgActive: Boolean(bgUrl),
  }
}
