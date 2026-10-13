import { useSiteBackground } from '../hooks/useSiteBackground'

export default function SiteBackground() {
  const { bgUrl, bgRepeat, bgOpacity, bgActive } = useSiteBackground()

  if (!bgActive || !bgUrl) return null

  return (
    <>
      {/* Background Image / Pattern Layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-20 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundRepeat: bgRepeat ? 'repeat' : 'no-repeat',
          backgroundSize: bgRepeat ? '380px auto' : 'cover',
          backgroundPosition: 'center top',
          opacity: bgOpacity,
        }}
      />
      {/* Readability backdrop tint */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 bg-white/40 dark:bg-[#18131e]/55 backdrop-blur-[0.5px] transition-colors duration-500"
      />
    </>
  )
}
