import type { Product } from '../types'

export function getProductShareUrl(productId: string): string {
  const origin = window.location.origin
  const pathname = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')
  return `${origin}${pathname}/#/catalog?product=${productId}`
}

export function getProductShareText(product: Product, lang: 'es' | 'en'): string {
  const title = lang === 'es' ? product.title_es : product.title_en
  const price = product.price.toFixed(2)
  if (lang === 'es') {
    return `¡Mira este producto en MagicAlexa Shop! ✨ "${title}" ($${price})`
  }
  return `Check out this product on MagicAlexa Shop! ✨ "${title}" ($${price})`
}

export function getProductShareFullMessage(product: Product, lang: 'es' | 'en'): string {
  const title = lang === 'es' ? product.title_es : product.title_en
  const price = product.price.toFixed(2)
  const url = getProductShareUrl(product.id)
  if (lang === 'es') {
    return `✨ ¡Mira lo que encontré en MagicAlexa Shop!\n🛍️ ${title}\n💰 $${price} MXN\n🔗 Ver producto: ${url}`
  }
  return `✨ Look what I found on MagicAlexa Shop!\n🛍️ ${title}\n💰 $${price}\n🔗 Check it out: ${url}`
}

export function getProductIdFromUrl(): string | null {
  try {
    // 1. Check hash search params (HashRouter: #/catalog?product=xyz)
    const hash = window.location.hash
    if (hash.includes('?')) {
      const queryString = hash.substring(hash.indexOf('?'))
      const hashParams = new URLSearchParams(queryString)
      const id = hashParams.get('product')
      if (id) return id
    }

    // 2. Check standard search params (?product=xyz)
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('product')
  } catch {
    return null
  }
}
