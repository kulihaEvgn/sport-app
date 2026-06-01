'use client'

import { useRouter } from 'next/navigation'

// TODO Phase 4: Import Hub (Notion, Obsidian, Excel, CSV)
export default function ImportPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4">
      <p className="text-[15px]" style={{ color: 'var(--color-app-muted)' }}>Import Hub — Фаза 4</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 rounded-xl text-[14px] font-semibold"
        style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)', color: 'var(--color-app-text)', cursor: 'pointer' }}
      >
        Назад
      </button>
    </div>
  )
}
