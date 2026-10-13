import { useSiteBackground } from '../hooks/useSiteBackground'

export default function SiteBackground() {
  const { bgUrl } = useSiteBackground()

  if (!bgUrl) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 bg-repeat bg-center"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: '360px auto',
      }}
    />
  )
}
