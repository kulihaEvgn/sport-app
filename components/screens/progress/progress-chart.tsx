'use client'

import type { ExerciseProgressPoint } from '@/services/progress'

interface Props {
  points: ExerciseProgressPoint[]
}

export default function ProgressChart({ points }: Props) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-[120px]" style={{ color: 'var(--color-app-muted)', fontSize: 13 }}>
        Недостаточно данных
      </div>
    )
  }

  const W   = 300
  const H   = 120
  const PAD = 8
  const maxW  = Math.max(...points.map(p => p.weight))
  const minW  = Math.min(...points.map(p => p.weight))
  const range = maxW - minW || 1

  const pts = points.map((p, i) => ({
    x: PAD + (i / (points.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((p.weight - minW) / range) * (H - PAD * 2),
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${pts.at(-1)!.x} ${H} L ${pts[0].x} ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--color-app-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-app-accent)" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <path d={line} fill="none" stroke="var(--color-app-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-app-accent)" />
      ))}
    </svg>
  )
}
