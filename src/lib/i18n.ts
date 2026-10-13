import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  es: {
    translation: {
      // Nav
      nav_home: 'Inicio',
      nav_catalog: 'Catálogo',
      nav_shipping: 'Envíos',
      nav_admin: 'Admin',
      nav_language: 'EN',
      
      // Hero
      hero_title: '¡Bienvenido a la Tienda Pusheen!',
      hero_subtitle: 'Descubre la colección más tierna de peluches, accesorios y artículos de Pusheen',
      hero_cta: 'Explorar Catálogo',
      
      // Catalog
      catalog_title: 'Nuestro Catálogo',
      catalog_search: 'Buscar productos...',
      catalog_all: 'Todos',
      catalog_empty: 'No se encontraron productos',
      catalog_whatsapp: '¡Lo quiero!',
      catalog_stock_out: 'Agotado',
      
      // Badges
      badge_new: 'Nuevo',
      badge_last: 'Última Pieza',
      badge_sold_out: 'Agotado',
      badge_exclusive: 'Exclusivo',
      
      // Shipping
      shipping_title: 'Métodos de Envío',
      shipping_subtitle: 'Elige la opción que mejor se adapte a ti',
      shipping_cost: 'Costo aprox.',
      shipping_time: 'Tiempo estimado',
      shipping_empty: 'No hay métodos de envío configurados',
      
      // Footer
      footer_rights: 'Todos los derechos reservados',
      footer_made: 'Hecho con',
      footer_pusheen: 'amor por Pusheen',
      
      // Admin
      admin_title: 'Panel de Administración',
      admin_login: 'Iniciar Sesión',
      admin_logout: 'Cerrar Sesión',
      admin_email: 'Correo electrónico',
      admin_password: 'Contraseña',
      admin_products: 'Productos',
      admin_categories: 'Categorías',
      admin_shipping: 'Envíos',
      admin_banner: 'Banner',
      admin_add: 'Agregar',
      admin_edit: 'Editar',
      admin_delete: 'Eliminar',
      admin_save: 'Guardar',
      admin_cancel: 'Cancelar',
      admin_confirm_delete: '¿Estás seguro de que deseas eliminar este elemento?',
      admin_name_es: 'Nombre (ES)',
      admin_name_en: 'Name (EN)',
      admin_title_es: 'Título (ES)',
      admin_title_en: 'Title (EN)',
      admin_desc_es: 'Descripción (ES)',
      admin_desc_en: 'Description (EN)',
      admin_price: 'Precio',
      admin_category: 'Categoría',
      admin_image: 'Imagen',
      admin_stock: 'En stock',
      admin_badge: 'Etiqueta',
      admin_slug: 'Slug',
      admin_banner_es: 'Texto Banner (ES)',
      admin_banner_en: 'Banner Text (EN)',
      admin_banner_active: 'Banner activo',
      admin_banner_link: 'Enlace del banner',
      admin_cost_note: 'Nota de costo',
      admin_delivery_time: 'Tiempo de entrega',
      admin_sort_order: 'Orden',
      admin_no_category: 'Sin categoría',
      
      // WhatsApp message
      whatsapp_msg: '¡Hola! Me interesa este artículo de Pusheen: {{title}} (${{price}}). ¿Sigue disponible?',
      
      // Theme
      theme_light: 'Modo claro',
      theme_dark: 'Modo oscuro',
    },
  },
  en: {
    translation: {
      // Nav
      nav_home: 'Home',
      nav_catalog: 'Catalog',
      nav_shipping: 'Shipping',
      nav_admin: 'Admin',
      nav_language: 'ES',
      
      // Hero
      hero_title: 'Welcome to the Pusheen Store!',
      hero_subtitle: 'Discover the cutest collection of plushies, accessories, and Pusheen items',
      hero_cta: 'Explore Catalog',
      
      // Catalog
      catalog_title: 'Our Catalog',
      catalog_search: 'Search products...',
      catalog_all: 'All',
      catalog_empty: 'No products found',
      catalog_whatsapp: 'I want it!',
      catalog_stock_out: 'Sold Out',
      
      // Badges
      badge_new: 'New',
      badge_last: 'Last One',
      badge_sold_out: 'Sold Out',
      badge_exclusive: 'Exclusive',
      
      // Shipping
      shipping_title: 'Shipping Methods',
      shipping_subtitle: 'Choose the option that suits you best',
      shipping_cost: 'Approx. cost',
      shipping_time: 'Estimated time',
      shipping_empty: 'No shipping methods configured',
      
      // Footer
      footer_rights: 'All rights reserved',
      footer_made: 'Made with',
      footer_pusheen: 'love for Pusheen',
      
      // Admin
      admin_title: 'Admin Panel',
      admin_login: 'Log In',
      admin_logout: 'Log Out',
      admin_email: 'Email',
      admin_password: 'Password',
      admin_products: 'Products',
      admin_categories: 'Categories',
      admin_shipping: 'Shipping',
      admin_banner: 'Banner',
      admin_add: 'Add',
      admin_edit: 'Edit',
      admin_delete: 'Delete',
      admin_save: 'Save',
      admin_cancel: 'Cancel',
      admin_confirm_delete: 'Are you sure you want to delete this item?',
      admin_name_es: 'Nombre (ES)',
      admin_name_en: 'Name (EN)',
      admin_title_es: 'Título (ES)',
      admin_title_en: 'Title (EN)',
      admin_desc_es: 'Descripción (ES)',
      admin_desc_en: 'Description (EN)',
      admin_price: 'Price',
      admin_category: 'Category',
      admin_image: 'Image',
      admin_stock: 'In stock',
      admin_badge: 'Badge',
      admin_slug: 'Slug',
      admin_banner_es: 'Banner Text (ES)',
      admin_banner_en: 'Banner Text (EN)',
      admin_banner_active: 'Banner active',
      admin_banner_link: 'Banner link',
      admin_cost_note: 'Cost note',
      admin_delivery_time: 'Delivery time',
      admin_sort_order: 'Sort order',
      admin_no_category: 'No category',
      
      // WhatsApp message
      whatsapp_msg: 'Hi! I\'m interested in this Pusheen item: {{title}} (${{price}}). Is it still available?',
      
      // Theme
      theme_light: 'Light mode',
      theme_dark: 'Dark mode',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
