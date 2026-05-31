'use client'

import { useRouter } from 'next/navigation'

// TODO Phase 4: program edit form
export default function EditProgramPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4">
      <p className="text-[15px]" style={{ color: '#6b7280' }}>Редактирование программы — Фаза 4</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 rounded-xl text-[14px] font-semibold"
        style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#f9fafb', cursor: 'pointer' }}
      >
        Назад
      </button>
    </div>
  )
}
