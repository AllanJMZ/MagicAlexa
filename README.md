# ✨ MagicAlexa BoliShop — Tienda Kawaii & Coleccionables

Aplicación web moderna de comercio electrónico y catálogo interactivo para **MagicAlexa BoliShop**, especializada en artículos coleccionables kawaii (Pusheen, peluches, papelería y moda). Diseñada con un enfoque centrado en la experiencia de usuario (UX), micro-interacciones visuales fluidas, diseño responsivo, soporte bilingüe (Español / Inglés), modo oscuro y conexión directa de compras por WhatsApp.

---

## 🚀 Stack Tecnológico

El proyecto está construido con un stack frontend moderno de alto rendimiento, complementado con una arquitectura BaaS (Backend-as-a-Service):

### Frontend & Core
- **[React 19 / 18](https://react.dev/)**: Biblioteca principal para la construcción de interfaces de usuario declarativas y reactivas basadas en componentes.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático estricto en todo el flujo de datos (modelos de productos, categorías, configuración del sitio, métodos de envío y estados).
- **[Vite 8](https://vitejs.dev/)**: Herramienta de compilación y empaquetado de última generación con Hot Module Replacement (HMR) ultrarrápido y optimización de bundles para producción.
- **[React Router DOM v7](https://reactrouter.com/)**: Enrutamiento del lado del cliente mediante `HashRouter` para garantizar navegación fluida sin errores 404 en alojamientos estáticos o CDNs (Vercel, GitHub Pages).

### Diseño, Estilos & Animaciones
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Motor de utilidades CSS para diseño atómico y responsivo.
- **Vanilla CSS Tokens & Keyframes**: Animaciones fluidas personalizadas (`shimmer`, `float`, `gradient`, `glow`, `pulse-ring`, `bounce-gentle`).
- **Google Fonts**: Tipografías seleccionadas `Quicksand` (títulos y acentos tiernos) y `Nunito` (lectura cómoda y legible).
- **[Lucide React](https://lucide.react.dev/)**: Conjunto de iconos vectoriales ligeros, complementado con iconos SVG personalizados para marcas (WhatsApp, Instagram, Facebook).

### Backend, Base de Datos & Almacenamiento (BaaS)
- **[Supabase](https://supabase.com/)**:
  - **PostgreSQL Database**: Tablas relacionales para `products`, `categories`, `shipping_methods`, `site_settings` y métricas.
  - **Supabase Auth**: Autenticación segura basada en JWT para el acceso al panel de administración.
  - **Supabase Storage**: Bucket público `product-images` para la carga y almacenamiento de fotografías en alta resolución.
  - **Local State Fallback & Event Bus**: Sistema híbrido con persistencia en `localStorage` y sincronización reactiva instantánea entre componentes mediante `CustomEvent`.

### Internacionalización (i18n)
- **[i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)**: Soporte bilingüe completo (Español / Inglés) con cambio de idioma dinámico sin recargar la página.

---

## 📂 Arquitectura del Proyecto

```text
MagicAlexaShop/
├── public/                     # Recursos estáticos públicos (wallpapers, favicon, logos)
│   └── bg-halloween.jpg        # Patrón de fondo seamless temático de murciélagos
├── src/
│   ├── components/             # Componentes modulares y reutilizables
│   │   ├── AnimatedStar.tsx    # Estrella kawaii interactiva con micro-animaciones
│   │   ├── Banner.tsx          # Banner de anuncios superior configurable
│   │   ├── BulkImportAdmin.tsx # Módulo de carga masiva de productos (CSV/Excel)
│   │   ├── BulkPhotosAdmin.tsx # Módulo de carga masiva de fotos por lotes
│   │   ├── Footer.tsx          # Pie de página con créditos y redes sociales
│   │   ├── Navbar.tsx          # Barra de navegación con temas, idioma y enlaces
│   │   ├── ProductCard.tsx     # Tarjeta de producto con carrusel multifoto y WhatsApp
│   │   ├── ProductDetailModal.tsx # Modal con zoom y detalles del producto
│   │   ├── ScrollProgress.tsx  # Barra de progreso de lectura en cabecera
│   │   ├── ScrollToTop.tsx     # Botón flotante para volver arriba
│   │   ├── SiteBackground.tsx  # Capa de fondo optimizada por GPU (60 FPS)
│   │   └── SocialIcons.tsx     # Iconos SVG y enlaces oficiales de redes
│   ├── context/
│   │   └── ThemeContext.tsx    # Contexto global para modo claro / oscuro
│   ├── hooks/                  # Custom Hooks con lógica de negocio desacoplada
│   │   ├── useAnimations.ts    # Hooks para reveal on scroll y transiciones
│   │   ├── useFeaturedProducts.ts # Gestión reactiva de productos destacados en inicio
│   │   ├── useProductViews.ts  # Contador y podio de visitas por producto
│   │   ├── useSiteBackground.ts # Control del fondo de pantalla de la tienda
│   │   └── useSupabase.ts      # Conexión CRUD a Supabase con datos demo fallback
│   ├── lib/
│   │   ├── i18n.ts             # Diccionarios de traducción (ES / EN)
│   │   └── supabase.ts         # Cliente inicializado de Supabase y constantes
│   ├── pages/                  # Vistas principales de la aplicación
│   │   ├── Admin.tsx           # Panel de administración completo con múltiples pestañas
│   │   ├── Catalog.tsx         # Catálogo público con filtros y búsqueda
│   │   ├── Home.tsx            # Página de inicio con Hero, carrusel y beneficios
│   │   └── Shipping.tsx        # Información y tarifas de métodos de envío
│   ├── types/
│   │   └── index.ts            # Definiciones de tipos e interfaces TypeScript
│   ├── App.tsx                 # Contenedor raíz y enrutamiento con HashRouter
│   ├── index.css               # Estilos globales, directivas Tailwind y keyframes
│   └── main.tsx                # Punto de entrada de la aplicación React
├── index.html                  # HTML base con metaetiquetas y SEO
├── package.json                # Dependencias y scripts de construcción
├── vite.config.ts              # Configuración del compilador Vite
└── tsconfig.json               # Configuración de TypeScript
```

---

## 💎 Módulos y Funcionalidades Clave

### 1. 🛍️ Catálogo Interactivo y Búsqueda en Vivo
- **Filtrado por Categorías**: Navegación ágil por colecciones (Peluches clásicos, comida, blind boxes, papelería, moda y accesorios).
- **Búsqueda Instantánea**: Búsqueda en tiempo real por palabras clave en títulos en español e inglés.
- **Carrusel Multifoto por Producto**: Soporte para hasta 3 imágenes por artículo con controles de navegación táctiles y teclado.
- **Insignias de Estado**: Badges visuales claros (`Nuevo`, `Últimas piezas`, `Agotado`, `Exclusivo`).
- **Conversión Directa por WhatsApp**: Botón de pedido que abre WhatsApp con el mensaje pre-rellenado que incluye el nombre del producto y el precio exacto.

### 2. 🏠 Portada de Inicio Dinámica
- **Hero Interactivo**: Título con degradado animado, estrella flotante interactiva y huellitas de gatito decorativas.
- **Mini Carrusel de Destacados**: Sección para destacar hasta 10 productos seleccionados directamente desde el panel de administración.
- **Tarjeta de Temporada**: Espacio visual para destacar la colección vigente (título, descripción e imagen personalizable).
- **Métricas de la Tienda**: Tarjetas con estadísticas visuales (`Productos`, `Calificación 5.0`, `Respuesta 24h`) con fondos sólidos de alto contraste.
- **Comunidad y Redes Oficiales**: Botones directos al grupo oficial de WhatsApp, Instagram y Facebook.

### 3. 📦 Sección de Envíos
- Tarjetas de información clara sobre cobertura nacional (FedEx, Estafeta, DHL), tiempos de entrega y costos.
- Diseñadas con fondo sólido y bordes definidos para garantizar legibilidad óptima tanto en temas claros como oscuros.
- Editables y administrables dinámicamente desde el panel de control.

### 4. 👁️ Contador de Visitas & Ranking en Vivo
- Registra automáticamente cada visualización cuando un visitante explora un producto (clic en tarjeta, modal de detalles o pedido por WhatsApp).
- **Podio Top 5 Más Vistos**: En el panel de administración se muestra un widget con medallas (🥇, 🥈, 🥉) para identificar de un vistazo los artículos más populares.
- **Ordenamiento Inteligente**: Permite ordenar la tabla por:
  - 🕒 Más recientes
  - 🔥 Más vistos (Popularidad)
  - 💵 Menor precio
  - 💎 Mayor precio
- Cada producto muestra su badge distintivo: `👁️ X vistas`.

### 5. 🖼️ Fondo de Pantalla Personalizado (Wallpaper)
- Renderizado ultra liviano mediante una capa acelerada por GPU sin filtros de desenfoque costosos, garantizando **60 FPS estables** en scroll.
- **Gestor en el Admin**:
  - Opción de activar el patrón de **🦇 Murciélagos Halloween**.
  - Opción para **subir una foto propia** o pegar una URL directa.
  - Opción de **desactivar fondo** para una apariencia limpia.
- Compatible con fondos sólidos en todas las tarjetas de la tienda para evitar que los textos se pierdan en el tema claro.

### 6. 📥 Carga Masiva de Productos y Fotos
- **Carga Masiva de Catálogo**: Módulo con tabla editable para importar productos por lotes, validar duplicados, asociar categorías sugeridas y exportar/importar planillas.
- **Carga Masiva de Fotografías**: Subida simultánea de múltiples fotos a Supabase Storage con emparejamiento inteligente por nombre de archivo.

### 7. 🛡️ Panel de Administración (`/admin`)
- Autenticación protegida con Supabase Auth.
- Gestión CRUD de productos con selector de hasta 3 ranuras de fotos (Foto 1: Principal, Foto 2, Foto 3) y eliminación individual.
- Gestión de categorías y métodos de envío.
- Control de banner de anuncios superior, colecciones de temporada y wallpaper.

---

## ⚙️ Variables de Entorno

Para habilitar la sincronización en la nube con Supabase, crea un archivo `.env` en la raíz del proyecto:

```env
# Conexión con Supabase BaaS
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_llave_anonima_publica

# Número de WhatsApp para pedidos (código de país + número, sin espacios ni signos)
VITE_WHATSAPP_NUMBER=521XXXXXXXXXX
```

> **Nota:** La aplicación incluye un sistema de contingencia (*fallback*) con datos demostrativos precargados y almacenamiento en `localStorage`, lo que permite que la tienda funcione y sea navegable incluso sin configurar Supabase inicialmente.

---

## 🛠️ Comandos de Desarrollo y Compilación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Validar TypeScript y compilar bundle de producción
npm run build

# 4. Previsualizar bundle de producción localmente
npm run preview
```

---

## 🌐 Despliegue en Vercel

El proyecto está configurado para despliegue continuo (CI/CD) conectado a la rama `main`:

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Variables de Entorno en Vercel**: Agregar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_WHATSAPP_NUMBER` en la sección *Settings > Environment Variables*.

---

## 📱 Redes Sociales Oficiales

- **Instagram**: [magiccalexa_bolishop](https://www.instagram.com/magiccalexa_bolishop/)
- **Grupo de WhatsApp**: [Comunidad Oficial MagicAlexa](https://chat.whatsapp.com/Dj9KYMa7x5z92relKdRFTI)
- **Facebook**: [MagicCalexaBolishop](https://www.facebook.com/MagicCalexaBolishop#)

---

Hecho con 💖 para **MagicAlexa BoliShop**.
