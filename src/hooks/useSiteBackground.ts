import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

  // Sincronizar desde la nube de Supabase para que todos los usuarios y administradores vean los mismos cambios
  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        if (!supabaseUrl) return
        const res = await fetch(`${supabaseUrl}/storage/v1/object/public/product-images/site-config.json?t=${Date.now()}`)
        if (res.ok) {
          const remoteData = await res.json()
          if (remoteData && typeof remoteData.bgUrl === 'string') {
            setBgUrlState(remoteData.bgUrl)
            try {
              localStorage.setItem(STORAGE_KEY, remoteData.bgUrl)
            } catch {}
          }
          if (remoteData?.season) {
            try {
              localStorage.setItem('magic_season_settings', JSON.stringify(remoteData.season))
              window.dispatchEvent(new CustomEvent('magic_season_updated', { detail: remoteData.season }))
            } catch {}
          }
        }
      } catch {
        // En caso de estar offline o error de red se mantiene el valor local
      }
    }

    fetchRemoteConfig()

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
    window.addEventListener('focus', fetchRemoteConfig)

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('focus', fetchRemoteConfig)
    }
  }, [])

  const saveBgUrl = async (url: string) => {
    setBgUrlState(url)
    try {
      localStorage.setItem(STORAGE_KEY, url)
      window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
      // ignore
    }

    // Subir a la nube de Supabase Storage para persistencia global compartida entre todos los dispositivos y administradores
    try {
      let currentSeason = {}
      try {
        currentSeason = JSON.parse(localStorage.getItem('magic_season_settings') || '{}')
      } catch {}

      const fullConfig = {
        bgUrl: url,
        season: currentSeason,
        updatedAt: Date.now(),
      }

      await supabase.storage.from('product-images').upload('site-config.json', JSON.stringify(fullConfig), {
        contentType: 'application/json',
        upsert: true,
      })
    } catch (err) {
      console.warn('Error syncing site-config.json to Supabase:', err)
    }
  }

  return {
    bgUrl,
    saveBgUrl,
    bgActive: Boolean(bgUrl),
  }
}
