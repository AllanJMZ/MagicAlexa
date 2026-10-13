import { useScrollProgress } from '../hooks/useAnimations'

export default function ScrollProgress() {
  const progress = useScrollProgress()

  if (progress <= 0) return null

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress * 100}%` }}
    />
  )
}
