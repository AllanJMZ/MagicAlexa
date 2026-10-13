import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Cat,
  Globe,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react'
import { FacebookIcon, InstagramIcon } from './SocialIcons'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  const links = [
    { to: '/', label: t('nav_home') },
    { to: '/catalog', label: t('nav_catalog') },
    { to: '/shipping', label: t('nav_shipping') },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? 'backdrop-blur-xl bg-white/85 dark:bg-[#1F1B24]/85 border-b border-pink-200/50 dark:border-purple-800/50 shadow-sm shadow-pink-100/20 dark:shadow-purple-900/10'
        : 'backdrop-blur-md bg-white/70 dark:bg-[#1F1B24]/70 border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Cat className="w-8 h-8 text-pink-400 dark:text-pink-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
            </div>
            <span className="font-['Quicksand'] font-bold text-xl text-gradient">
              MagicAlexa Shop
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 font-['Nunito'] ${isActive(link.to)
                  ? 'bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900/40 dark:to-purple-900/40 text-pink-700 dark:text-pink-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-purple-900/20 hover:text-pink-600 dark:hover:text-pink-300'
                  }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full" />
                )}
              </Link>
            ))}
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive('/admin')
                ? 'text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-300'
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Social */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-all duration-300 hover:scale-110 hover:rotate-12"
              aria-label={t(theme === 'light' ? 'theme_dark' : 'theme_light')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-pink-200 dark:border-purple-700 text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-105 btn-press"
            >
              <Globe className="w-3 h-3" />
              {t('nav_language')}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all"
            >
              <div className="relative w-5 h-5">
                <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                <X className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 py-3 space-y-1 bg-white/95 dark:bg-[#1F1B24]/95 backdrop-blur-xl border-t border-pink-100 dark:border-purple-800/30">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold font-['Nunito'] transition-all duration-300 ${isActive(link.to)
                ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-purple-900/20'
                }`}
              style={{
                transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms',
                transform: mobileOpen ? 'translateX(0)' : 'translateX(-10px)',
                opacity: mobileOpen ? 1 : 0,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            style={{
              transitionDelay: mobileOpen ? `${links.length * 50}ms` : '0ms',
              transform: mobileOpen ? 'translateX(0)' : 'translateX(-10px)',
              opacity: mobileOpen ? 1 : 0,
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            {t('nav_admin')}
          </Link>

          {/* Mobile social links */}
          <div className="flex items-center gap-3 px-4 pt-2 sm:hidden">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
