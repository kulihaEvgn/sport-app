'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Dumbbell, Calendar, Trophy, ChevronRight, Moon, Sun, ArrowLeft } from 'lucide-react'
import { useSignal, initDataUser } from '@telegram-apps/sdk-react'
import { useActiveProgram } from '@/hooks/use-programs'
import { useWorkoutHistory } from '@/hooks/use-history'
import { useFavoriteMuscleGroup } from '@/hooks/use-progress'
import { useThemeStore } from '@/store/theme-store'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '@/lib/muscle-groups'
import { useUser } from '@/hooks/use-user'

export default function ProfileScreen() {
  const router  = useRouter()
  const tgUser  = useSignal(initDataUser)
  const { theme, toggle } = useThemeStore()
  const { data: dbUser }         = useUser()
  const uid                      = dbUser?.id ?? ''

  const { data: activeProgram }  = useActiveProgram()
  const { data: history = [] }   = useWorkoutHistory(uid)
  const { data: favMuscle }      = useFavoriteMuscleGroup(uid)

  const { totalWorkouts, weeksActive } = useMemo(() => {
    const completed = history.filter(l => l.isCompleted)
    const oldest    = completed.at(-1)?.startedAt
    return {
      totalWorkouts: completed.length,
      weeksActive:   oldest ? Math.ceil((Date.now() - oldest.getTime()) / (7 * 24 * 3600 * 1000)) : 0,
    }
  }, [history])

  const displayName = tgUser?.first_name ?? dbUser?.firstName ?? 'User'
  const username    = tgUser?.username ?? dbUser?.username

  return (
    <div className="flex flex-col px-4 pt-5 pb-6 gap-5 overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[14px] font-medium self-start"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-accent)' }}
      >
        <ArrowLeft size={18} color="var(--color-app-accent)" />
        Назад
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[22px] font-bold"
        style={{ color: 'var(--color-app-text)' }}
      >
        Профиль
      </motion.h1>

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl px-4 py-5 flex items-center gap-4"
        style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
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
            style={{ background: 'var(--color-app-accent-soft)', border: '2px solid var(--color-app-accent-border-2)' }}
          >
            <User size={30} color="var(--color-app-accent)" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[19px] font-bold truncate" style={{ color: 'var(--color-app-text)' }}>{displayName}</div>
          {username && (
            <div className="text-[13px] mt-0.5" style={{ color: 'var(--color-app-muted)' }}>@{username}</div>
          )}
          <div
            className="text-[11px] mt-1.5 px-2 py-0.5 rounded-lg inline-block font-semibold"
            style={{ background: 'var(--color-app-accent-subtle)', color: 'var(--color-app-accent)' }}
          >
            Telegram
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <StatCard icon={<Trophy size={20} color="var(--color-app-accent)" />}     value={String(totalWorkouts)} label="тренировок" />
        <StatCard icon={<Calendar size={20} color="var(--color-app-cyan)" />}   value={String(weeksActive)}   label="недель в зале" />
        <StatCard
          icon={<Dumbbell size={20} color={favMuscle ? MUSCLE_GROUP_COLORS[favMuscle] : '#f59e0b'} />}
          value={favMuscle ? MUSCLE_GROUP_LABELS[favMuscle] : '—'}
          label="любимая гр."
          valueColor={favMuscle ? MUSCLE_GROUP_COLORS[favMuscle] : 'var(--color-app-text)'}
          small={Boolean(favMuscle)}
        />
      </motion.div>

      {/* Active program */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Section label="АКТИВНАЯ ПРОГРАММА">
          {activeProgram ? (
            <button
              onClick={() => router.push('/library/programs')}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:opacity-80"
              style={{ background: 'var(--color-app-accent-glow)', border: '1px solid var(--color-app-accent-border)', cursor: 'pointer' }}
            >
              <Dumbbell size={18} color="var(--color-app-accent)" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-app-text)' }}>
                  {activeProgram.name}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-app-muted)' }}>
                  {activeProgram.templates.length} дней в цикле · {activeProgram.daysPerWeek} дн/нед
                </div>
              </div>
              <ChevronRight size={16} color="var(--color-app-muted)" className="flex-shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/library/programs')}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)', cursor: 'pointer' }}
            >
              <Dumbbell size={18} color="var(--color-app-muted)" />
              <span className="flex-1 text-[14px]" style={{ color: 'var(--color-app-muted)' }}>Выбрать программу</span>
              <ChevronRight size={16} color="var(--color-app-muted)" />
            </button>
          )}
        </Section>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Section label="НАСТРОЙКИ">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-app-card-border)' }}>
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: 'var(--color-app-card)' }}
            >
              {theme === 'dark'
                ? <Moon size={16} color="#a78bfa" />
                : <Sun  size={16} color="#f59e0b" />
              }
              <span className="flex-1 text-[14px]" style={{ color: 'var(--color-app-text)' }}>Тема</span>
              <button
                onClick={toggle}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-semibold"
                style={{
                  background: theme === 'dark' ? 'rgba(167,139,250,0.12)' : 'rgba(245,158,11,0.12)',
                  color:      theme === 'dark' ? '#a78bfa' : '#f59e0b',
                  border:     `1px solid ${theme === 'dark' ? 'rgba(167,139,250,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  cursor: 'pointer',
                }}
              >
                {theme === 'dark' ? 'Тёмная' : 'Светлая'}
              </button>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <Section label="ПРИЛОЖЕНИЕ">
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium" style={{ color: 'var(--color-app-text)' }}>GymApp</span>
              <span className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>v0.1.0</span>
            </div>
            <div className="text-[12px] mt-1" style={{ color: 'var(--color-app-muted)' }}>Telegram Mini App · Фазы 1–7</div>
          </div>
        </Section>
      </motion.div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  icon, value, label, valueColor = 'var(--color-app-text)', small = false,
}: {
  icon: React.ReactNode
  value: string
  label: string
  valueColor?: string
  small?: boolean
}) {
  return (
    <div
      className="flex-1 rounded-2xl px-3 py-4 flex flex-col items-center gap-1"
      style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}
    >
      {icon}
      <div
        className={`font-bold text-center leading-tight ${small ? 'text-[14px]' : 'text-[22px]'}`}
        style={{ color: valueColor }}
      >
        {value}
      </div>
      <div className="text-[11px] text-center" style={{ color: 'var(--color-app-muted)' }}>{label}</div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}
