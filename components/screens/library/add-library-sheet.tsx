'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import { BottomSheet } from '@/components/ui/bottom-sheet'

type Context = 'exercises' | 'programs'
type View = 'options' | 'import'

const SOURCES = [
  {
    id: 'notion',
    title: 'Notion',
    subtitle: 'Notion API → JSON',
    iconBg: '#000000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
  },
  {
    id: 'obsidian',
    title: 'Obsidian',
    subtitle: '.md файл → Markdown таблицы',
    iconBg: '#7c3aed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L19 8.5v7L12 19.82 5 15.5v-7l7-4.32z" />
      </svg>
    ),
  },
  {
    id: 'excel',
    title: 'Excel',
    subtitle: 'SheetJS → .xlsx',
    iconBg: '#16a34a',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 4h2v2H8v-2zm0 4h2v2H8v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'csv',
    title: 'CSV',
    subtitle: 'papaparse → .csv',
    iconBg: '#0891b2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

interface Props {
  open: boolean
  context: Context
  onClose: () => void
  onCreate: () => void
  onGenerate?: () => void
}

export default function AddLibrarySheet({ open, context, onClose, onCreate, onGenerate }: Props) {
  const [view, setView] = useState<View>('options')
  const router = useRouter()

  function handleClose() {
    onClose()
    // reset view after sheet closes
    setTimeout(() => setView('options'), 300)
  }

  function handleSourcePick(sourceId: string) {
    handleClose()
    router.push(`/library/import?context=${context}&source=${sourceId}`)
  }

  const isExercises = context === 'exercises'

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {view === 'options' ? (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
          <p className="text-[17px] font-bold" style={{ color: 'var(--color-app-text)' }}>
            {isExercises ? 'Добавить упражнение' : 'Добавить программу'}
          </p>
          <SheetRow
            icon={<Plus size={20} color="#fff" strokeWidth={2.5} />}
            iconBg="var(--color-app-accent)"
            title="Создать"
            subtitle={isExercises ? 'Добавить своё упражнение' : 'Составить свою программу'}
            onClick={onCreate}
          />
          <SheetRow
            icon={<Download size={20} color="#fff" strokeWidth={2} />}
            iconBg="#0e7490"
            title="Импортировать"
            subtitle={isExercises ? 'Из базы готовых упражнений' : 'Из базы готовых программ'}
            onClick={() => setView('import')}
          />
          {!isExercises && onGenerate && (
            <SheetRow
              icon={<Sparkles size={20} color="#fff" strokeWidth={2} />}
              iconBg="#7c3aed"
              title="Сгенерировать"
              subtitle="Claude составит программу под твои параметры"
              onClick={() => { handleClose(); onGenerate() }}
            />
          )}
        </div>
      ) : (
        <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setView('options')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <ArrowLeft size={18} color="var(--color-app-accent)" />
            </button>
            <p className="text-[17px] font-bold" style={{ color: 'var(--color-app-text)' }}>Источник данных</p>
          </div>

          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-1"
            style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Выберите источник
          </p>

          {SOURCES.map(source => (
            <SheetRow
              key={source.id}
              icon={source.icon}
              iconBg={source.iconBg}
              title={source.title}
              subtitle={source.subtitle}
              onClick={() => handleSourcePick(source.id)}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  )
}

function SheetRow({
  icon, iconBg, title, subtitle, onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left"
      style={{
        background: 'var(--color-app-card)',
        border: '1px solid var(--color-app-card-border)',
        cursor: 'pointer',
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-semibold" style={{ color: 'var(--color-app-text)' }}>{title}</p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>{subtitle}</p>
      </div>
      <ChevronRight size={16} color="var(--color-app-muted)" />
    </button>
  )
}
