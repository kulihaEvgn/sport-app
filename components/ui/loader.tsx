'use client'

import { motion } from 'framer-motion'

// Inline spinner — for buttons and small contexts
export function Spinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  )
}

// Full-page centered loader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
      <Spinner size={28} color="var(--color-app-accent)" />
    </div>
  )
}

// Pulsing skeleton block
export function SkeletonBlock({ height = 56, rounded = 16 }: { height?: number; rounded?: number }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        height,
        borderRadius: rounded,
        background: 'var(--color-app-card)',
        border: '1px solid var(--color-app-card-border)',
      }}
    />
  )
}

// Skeleton list of N cards
export function SkeletonList({ count = 4, height = 56, gap = 8 }: { count?: number; height?: number; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} height={height} />
      ))}
    </div>
  )
}
