export interface Category {
  id: string
  name_es: string
  name_en: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  title_es: string
  title_en: string
  description_es: string | null
  description_en: string | null
  price: number
  category_id: string | null
  image_url: string
  images?: string[]
  in_stock: boolean
  badge: string | null
  created_at: string
}

export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images.filter(Boolean)
  }
  if (!product.image_url) return []
  if (product.image_url.startsWith('[') && product.image_url.endsWith(']')) {
    try {
      const parsed = JSON.parse(product.image_url)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      // ignore
    }
  }
  return product.image_url.split(',').map(s => s.trim()).filter(Boolean)
}


export interface ShippingMethod {
  id: string
  title_es: string
  title_en: string
  description_es: string | null
  description_en: string | null
  cost_note: string | null
  delivery_time: string | null
  sort_order: number
  created_at: string
}

export interface SiteSettings {
  id: string
  banner_text_es: string
  banner_text_en: string
  banner_active: boolean
  banner_link: string
  season_image_url?: string | null
  season_title_es?: string | null
  season_title_en?: string | null
  season_desc_es?: string | null
  season_desc_en?: string | null
}

