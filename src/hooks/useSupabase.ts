import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Product, ShippingMethod, SiteSettings } from '../types'

// ─── Demo data (shown when Supabase is not configured) ─────
const IS_DEMO = import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'
  || !import.meta.env.VITE_SUPABASE_URL

const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name_es: 'Peluches', name_en: 'Plushies', slug: 'peluches', created_at: '' },
  { id: 'cat-2', name_es: 'Cocina', name_en: 'Kitchen', slug: 'cocina', created_at: '' },
]

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title_es: 'Peluche Pusheen Clásico',
    title_en: 'Classic Pusheen Plush',
    description_es: 'El adorable peluche de Pusheen en su pose clásica. Suave, esponjoso y perfecto para abrazar. Tamaño mediano (30 cm).',
    description_en: 'The adorable Pusheen plush in her classic pose. Soft, fluffy and perfect for hugging. Medium size (30 cm).',
    price: 459.00,
    category_id: 'cat-1',
    image_url: './demo-plush.jpg',
    in_stock: true,
    badge: 'new',
    created_at: '',
  },
  {
    id: 'prod-2',
    title_es: 'Taza Gatito Kawaii con Plato',
    title_en: 'Kawaii Cat Mug with Saucer',
    description_es: 'Taza de cerámica en forma de gatito con plato y cucharita. Colores pastel rosa y lavanda. Capacidad 350 ml.',
    description_en: 'Cat-shaped ceramic mug with saucer and spoon. Pastel pink and lavender colors. 350 ml capacity.',
    price: 289.00,
    category_id: 'cat-2',
    image_url: './demo-mug.jpg',
    in_stock: true,
    badge: 'exclusive',
    created_at: '',
  },
]

const DEMO_SHIPPING: ShippingMethod[] = [
  {
    id: 'ship-1',
    title_es: 'Entrega Personal / Punto Medio',
    title_en: 'Personal Delivery / Meeting Point',
    description_es: 'Nos ponemos de acuerdo para entregarte tu pedido en un punto céntrico de la ciudad. ¡Sin costo adicional!',
    description_en: 'We arrange to deliver your order at a central meeting point in the city. No extra cost!',
    cost_note: 'Gratis',
    delivery_time: '1-2 días',
    sort_order: 0,
    created_at: '',
  },
  {
    id: 'ship-2',
    title_es: 'Paquetería Nacional',
    title_en: 'National Courier',
    description_es: 'Envío seguro a cualquier parte del país por paquetería con rastreo incluido. Empacamos con mucho amor y protección.',
    description_en: 'Safe shipping anywhere in the country via courier with tracking included. We pack with lots of love and protection.',
    cost_note: '$99 - $149 MXN',
    delivery_time: '3-5 días hábiles',
    sort_order: 1,
    created_at: '',
  },
]

const DEMO_SETTINGS: SiteSettings = {
  id: 'main_config',
  banner_text_es: '¡Envíos seguros a todo el país! Pregunta por piezas exclusivas en WhatsApp ✨',
  banner_text_en: 'Safe shipping nationwide! Inquire about exclusive items on WhatsApp ✨',
  banner_active: true,
  banner_link: '',
  season_image_url: './season-image.jpg',
  season_title_es: '✨ Temporada Otoño 2026',
  season_title_en: '✨ Autumn Season 2026',
  season_desc_es: 'Nuevas piezas de la colección de temporada ya disponibles 🍂',
  season_desc_en: 'New seasonal collection pieces now available 🍂',
}

// ─── Hooks ────────────────────────────────────────────

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    setLoading(true)
    if (IS_DEMO) {
      setCategories(DEMO_CATEGORIES)
    } else {
      const { data, error } = await supabase.from('categories').select('*').order('name_es')
      if (error) console.error('Error fetching categories from Supabase:', error)
      setCategories(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])
  return { categories, loading, refetch: fetchCategories }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    if (IS_DEMO) {
      setProducts(DEMO_PRODUCTS)
    } else {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) console.error('Error fetching products from Supabase:', error)
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])
  return { products, loading, refetch: fetchProducts }
}

export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMethods = async () => {
    setLoading(true)
    if (IS_DEMO) {
      setMethods(DEMO_SHIPPING)
    } else {
      const { data, error } = await supabase.from('shipping_methods').select('*').order('sort_order')
      if (error) console.error('Error fetching shipping methods from Supabase:', error)
      setMethods(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchMethods() }, [])
  return { methods, loading, refetch: fetchMethods }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    setLoading(true)
    if (IS_DEMO) {
      setSettings(DEMO_SETTINGS)
    } else {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main_config').maybeSingle()
      if (error) console.error('Error fetching site_settings from Supabase:', error)
      setSettings(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])
  return { settings, loading, refetch: fetchSettings }
}

export function useAuth() {
  const [user, setUser] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, login, logout }
}
