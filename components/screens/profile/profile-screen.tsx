'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Dumbbell, Calendar, Trophy, ChevronRight, Globe, Moon, ArrowLeft } from 'lucide-react'
import { useSignal, initDataUser } from '@telegram-apps/sdk-react'
import { getActiveProgram } from '@/services/programs'
import { getWorkoutHistory } from '@/services/history'
import { getFavoriteMuscleGroup } from '@/services/progress'
import { getExercises } from '@/services/exercises'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'
import { MOCK_USER } from '@/data/mock'
import type { Program, MuscleGroup } from '@/types'

export default function ProfileScreen() {
  const router = useRouter()
  const tgUser = useSignal(initDataUser)

  const [activeProgram,  setActiveProgram]  = useState<Program | null>(null)
  const [totalWorkouts,  setTotalWorkouts]  = useState(0)
  const [weeksActive,    setWeeksActive]    = useState(0)
  const [favMuscle,      setFavMuscle]      = useState<MuscleGroup | null>(null)

  useEffect(() => {
    getActiveProgram().then(setActiveProgram)

    Promise.all([getWorkoutHistory(MOCK_USER.id), getExercises()]).then(([logs, exercises]) => {
      const completed = logs.filter(l => l.isCompleted)
      setTotalWorkouts(completed.length)

      if (completed.length > 0) {
        const oldest = completed.at(-1)!.startedAt
        setWeeksActive(Math.ceil((Date.now() - oldest.getTime()) / (7 * 24 * 3600 * 1000)))
      }

      getFavoriteMuscleGroup(MOCK_USER.id, exercises).then(setFavMuscle)
    })
  }, [])

  const displayName = tgUser?.first_name ?? MOCK_USER.firstName
  const username    = tgUser?.username    ?? MOCK_USER.username

  return (
    <div className="flex flex-col px-4 pt-5 pb-6 gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[14px] font-medium"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80' }}
        >
          <ArrowLeft size={18} color="#4ade80" />
          Назад
        </button>
      </div>
      <h1 className="text-[22px] font-bold" style={{ color: '#f9fafb' }}>Профиль</h1>

      {/* User card */}
      <div
        className="rounded-2xl px-4 py-5 flex items-center gap-4"
        style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
      >
        {tgUser?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tgUser.photo_url}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.3)' }}
          >
            <User size={30} color="#4ade80" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[19px] font-bold truncate" style={{ color: '#f9fafb' }}>{displayName}</div>
          {username && (
            <div className="text-[13px] mt-0.5" style={{ color: '#6b7280' }}>@{username}</div>
          )}
          <div
            className="text-[11px] mt-1.5 px-2 py-0.5 rounded-lg inline-block font-semibold"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
          >
            Telegram
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <StatCard
          icon={<Trophy size={20} color="#4ade80" />}
          value={String(totalWorkouts)}
          label="тренировок"
        />
        <StatCard
          icon={<Calendar size={20} color="#22d3ee" />}
          value={String(weeksActive)}
          label="недель в зале"
        />
        <StatCard
          icon={<Dumbbell size={20} color="#f59e0b" />}
          value={favMuscle ? MUSCLE_GROUP_LABELS[favMuscle].slice(0, 3) : '—'}
          label="любимая гр."
          valueColor={favMuscle ? MUSCLE_GROUP_COLORS[favMuscle] : '#f9fafb'}
        />
      </div>

      {/* Active program */}
      <Section label="АКТИВНАЯ ПРОГРАММА">
        {activeProgram ? (
          <button
            onClick={() => router.push('/library/programs')}
            className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:opacity-80"
            style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)', cursor: 'pointer' }}
          >
            <Dumbbell size={18} color="#4ade80" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate" style={{ color: '#f9fafb' }}>
                {activeProgram.name}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>
                {activeProgram.templates.length} дней в цикле
                {' · '}{activeProgram.daysPerWeek} дн/нед
              </div>
            </div>
            <ChevronRight size={16} color="#6b7280" className="flex-shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => router.push('/library/programs')}
            className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', cursor: 'pointer' }}
          >
            <Dumbbell size={18} color="#6b7280" />
            <span className="flex-1 text-[14px]" style={{ color: '#6b7280' }}>Выбрать программу</span>
            <ChevronRight size={16} color="#6b7280" />
          </button>
        )}
      </Section>

      {/* Settings */}
      <Section label="НАСТРОЙКИ">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2d2d4e' }}>
          <SettingsRow
            icon={<Globe size={16} color="#22d3ee" />}
            label="Язык"
            value="Русский"
          />
          <div style={{ height: 1, background: '#2d2d4e' }} />
          <SettingsRow
            icon={<Moon size={16} color="#a78bfa" />}
            label="Тема"
            value="Тёмная"
          />
        </div>
      </Section>

      {/* App info */}
      <Section label="ПРИЛОЖЕНИЕ">
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium" style={{ color: '#f9fafb' }}>GymApp</span>
            <span className="text-[12px]" style={{ color: '#6b7280' }}>v0.1.0</span>
          </div>
          <div className="text-[12px] mt-1" style={{ color: '#6b7280' }}>Telegram Mini App · Фаза 1–7</div>
        </div>
      </Section>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  icon, value, label, valueColor = '#f9fafb',
}: {
  icon: React.ReactNode
  value: string
  label: string
  valueColor?: string
}) {
  return (
    <div
      className="flex-1 rounded-2xl px-3 py-4 flex flex-col items-center gap-1"
      style={{ background: '#1a1a2e', border: '1px solid #2d2d4e' }}
    >
      {icon}
      <div className="text-[22px] font-bold" style={{ color: valueColor }}>{value}</div>
      <div className="text-[11px] text-center" style={{ color: '#6b7280' }}>{label}</div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: '#6b7280', fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function SettingsRow({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ background: '#1a1a2e' }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="flex-1 text-[14px]" style={{ color: '#f9fafb' }}>{label}</span>
      <span className="text-[13px]" style={{ color: '#6b7280' }}>{value}</span>
    </div>
  )
}
