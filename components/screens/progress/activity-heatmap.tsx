'use client'

import { useMemo } from 'react'

interface Props {
  workoutDates: Set<string>
}

export default function ActivityHeatmap({ workoutDates }: Props) {
  const weeks = useMemo(() => {
    const cells: { count: number }[] = []
    const today = new Date()
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      cells.push({ count: workoutDates.has(d.toDateString()) ? 1 : 0 })
    }
    const rows: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [workoutDates])

  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((cell, di) => (
            <div
              key={di}
              className="w-[9px] h-[9px] rounded-sm"
              style={{
                background: cell.count > 0 ? 'var(--color-app-accent)' : 'var(--color-app-card)',
                border: `1px solid ${cell.count > 0 ? 'var(--color-app-accent-border-3)' : 'var(--color-app-card-border)'}`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
