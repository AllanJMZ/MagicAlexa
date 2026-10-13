/**
 * Animated star component for the admin login panel.
 * Features a glowing, rotating star with orbiting sparkles.
 */
export default function AnimatedStar({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse blur-xl" />

      {/* Orbiting sparkles */}
      <div className="absolute w-20 h-20 animate-[spin_8s_linear_infinite]">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-300 text-xs">✦</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-pink-300 text-xs">✦</span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-purple-300 text-xs">✦</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-pink-300 text-xs">✦</span>
      </div>

      {/* Inner rotating sparkles */}
      <div className="absolute w-14 h-14 animate-[spin_6s_linear_infinite_reverse]">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-200 text-[10px]">✧</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-purple-200 text-[10px]">✧</span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-pink-200 text-[10px]">✧</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-200 text-[10px]">✧</span>
      </div>

      {/* Main star */}
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12 relative z-10 drop-shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-bounce-gentle"
        fill="none"
      >
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899">
              <animate attributeName="stop-color" values="#ec4899;#a855f7;#ec4899" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#f59e0b">
              <animate attributeName="stop-color" values="#f59e0b;#ec4899;#f59e0b" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#a855f7">
              <animate attributeName="stop-color" values="#a855f7;#f59e0b;#a855f7" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#starGradient)"
          stroke="url(#starGradient)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.08;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  )
}
