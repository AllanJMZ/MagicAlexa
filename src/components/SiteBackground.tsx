import { useSiteBackground } from '../hooks/useSiteBackground'
import { useTheme } from '../context/ThemeContext'

export default function SiteBackground() {
  const { bgUrl } = useSiteBackground()
  const { theme } = useTheme()

  if (!bgUrl) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 bg-repeat bg-center transition-opacity duration-300"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: '360px auto',
        opacity: theme === 'dark' ? 1 : 0.15,
      }}
    />
  )
}
