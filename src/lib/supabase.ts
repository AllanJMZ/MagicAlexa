import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string || '').trim()
// Elimina /rest/v1 y diagonales finales si fueron agregadas por error
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string || '').trim()

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string || '').trim()

