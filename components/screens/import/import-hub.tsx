'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Sheet, Hash, Globe } from 'lucide-react'
import { useCreateExercise } from '@/hooks/use-exercises'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'
import { rowToExercise, parseMarkdownTable } from '@/lib/import-mapping'
import type { CreateExerciseInput } from '@/services/exercises'
import { Spinner } from '@/components/ui/loader'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SectionLabel } from '@/components/ui/section-label'
import { EmptyState } from '@/components/ui/empty-state'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

type SourceId = 'csv' | 'excel' | 'obsidian' | 'notion'

const SOURCES: { id: SourceId; title: string; subtitle: string; Icon: typeof FileText; color: string }[] = [
  { id: 'csv',      title: 'CSV',      subtitle: '.csv с колонками название / группа / инвентарь', Icon: FileText, color: '#0891b2' },
  { id: 'excel',    title: 'Excel',    subtitle: '.xlsx / .xls файл',                                Icon: Sheet,    color: '#16a34a' },
  { id: 'obsidian', title: 'Obsidian', subtitle: 'Markdown-таблица из заметки',                     Icon: Hash,     color: '#7c3aed' },
  { id: 'notion',   title: 'Notion',   subtitle: 'Integration token + database ID',                Icon: Globe,    color: '#000000' },
]

export default function ImportHub() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const context      = (searchParams.get('context') ?? 'exercises') as 'exercises' | 'programs'
  const initial      = (searchParams.get('source') ?? null) as SourceId | null
  const { top, bottom } = useSafeAreaInsets()

  const [source, setSource] = useState<SourceId | null>(initial)

  if (context === 'programs') {
    return (
      <div className="flex flex-col flex-1" style={{ paddingTop: top, paddingBottom: bottom }}>
        <ScreenHeader onBack={() => router.back()} title="Импорт программ" />
        <EmptyState
          title="Импорт программ в разработке"
          description="Пока что программы создаются вручную или через ИИ-генерацию. Импорт упражнений работает."
        />
      </div>
    )
  }

  if (!source) {
    return (
      <div className="flex flex-col flex-1" style={{ paddingTop: top, paddingBottom: bottom }}>
        <ScreenHeader onBack={() => router.back()} title="Импорт упражнений" />
        <div className="flex flex-col px-4 pt-4 gap-3 overflow-y-auto">
          <SectionLabel>Выберите источник</SectionLabel>
          {SOURCES.map(s => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left active:opacity-80"
              style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)', cursor: 'pointer' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.color }}
              >
                <s.Icon size={20} color="#fff" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--color-app-text)' }}>{s.title}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-app-muted)' }}>{s.subtitle}</p>
              </div>
            </button>
          ))}

          <div className="mt-2 px-4 py-3 rounded-2xl text-[12px] leading-relaxed"
            style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)', color: 'var(--color-app-muted)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--color-app-text)' }}>Формат данных</p>
            <p>
              Колонки: <b>название</b>, <b>группа мышц</b> (грудь / спина / ноги / плечи / бицепс / трицепс / кор / другое),
              <b> инвентарь</b>, <b>видео</b> (опционально), <b>описание</b> (опционально).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1" style={{ paddingTop: top, paddingBottom: bottom }}>
      <ScreenHeader onBack={() => setSource(null)} title={SOURCES.find(s => s.id === source)?.title ?? 'Импорт'} />
      <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {source === 'csv'      && <CsvImporter />}
        {source === 'excel'    && <ExcelImporter />}
        {source === 'obsidian' && <ObsidianImporter />}
        {source === 'notion'   && <NotionImporter />}
      </div>
    </div>
  )
}

// ─── Shared preview + import ────────────────────────────────────────────

function ImportPreview({ exercises, onClear }: { exercises: CreateExerciseInput[]; onClear: () => void }) {
  const router = useRouter()
  const { mutateAsync: createExercise } = useCreateExercise()
  const [importing, setImporting] = useState(false)
  const [done, setDone]           = useState(0)
  const [error, setError]         = useState<string | null>(null)

  if (!exercises.length) return null

  async function handleImport() {
    setImporting(true)
    setError(null)
    setDone(0)
    try {
      for (const ex of exercises) {
        await createExercise(ex)
        setDone(d => d + 1)
      }
      router.push('/library/exercises')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка импорта')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <SectionLabel
        rightSlot={
          <button onClick={onClear} disabled={importing}
            className="text-[12px] font-medium"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-app-muted)' }}>
            Очистить
          </button>
        }
      >
        Превью ({exercises.length})
      </SectionLabel>

      <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
        {exercises.slice(0, 50).map((ex, i) => (
          <div key={i} className="px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'var(--color-app-card)', border: '1px solid var(--color-app-card-border)' }}>
            <span className="text-[11px] w-5 flex-shrink-0"
              style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</span>
            <span className="text-[13px] font-semibold truncate flex-1"
              style={{ color: 'var(--color-app-text)' }}>{ex.name}</span>
            <span className="text-[11px] flex-shrink-0"
              style={{ color: 'var(--color-app-muted)' }}>{ex.muscleGroup}</span>
          </div>
        ))}
        {exercises.length > 50 && (
          <p className="text-[11px] text-center pt-1" style={{ color: 'var(--color-app-muted)' }}>
            … и ещё {exercises.length - 50}
          </p>
        )}
      </div>

      {error && (
        <p className="text-[12px] px-3 py-2 rounded-xl"
          style={{ color: 'var(--color-app-error)', background: 'rgba(239,68,68,0.08)' }}>{error}</p>
      )}

      <button onClick={handleImport} disabled={importing}
        className="h-12 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2"
        style={{
          background: importing ? 'var(--color-app-border)' : 'var(--color-app-accent)',
          color:      importing ? 'var(--color-app-muted)' : 'var(--color-app-on-accent)',
          border: 'none',
          cursor: importing ? 'not-allowed' : 'pointer',
        }}>
        {importing ? (
          <>
            <Spinner size={16} color="var(--color-app-muted)" />
            Импорт ({done}/{exercises.length})…
          </>
        ) : (
          `Импортировать ${exercises.length} упражнений`
        )}
      </button>
    </div>
  )
}

// ─── CSV ────────────────────────────────────────────────────────────────

function CsvImporter() {
  const [text, setText]   = useState('')
  const [parsed, setParsed] = useState<CreateExerciseInput[]>([])
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => setText(String(e.target?.result ?? ''))
    reader.readAsText(file)
  }

  function handleParse() {
    setError(null)
    if (!text.trim()) { setError('Вставь содержимое или загрузи файл'); return }
    try {
      const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
      const rows = result.data.map(rowToExercise).filter(Boolean) as CreateExerciseInput[]
      if (!rows.length) { setError('Не нашёл валидных строк. Проверь колонку с названием.'); return }
      setParsed(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка парсинга')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FileInput accept=".csv,text/csv" onPick={handleFile} label="Загрузить .csv" />
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
        placeholder="Или вставь содержимое CSV сюда:&#10;название,группа мышц,инвентарь&#10;Жим лёжа,грудь,Штанга"
        className="px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
        style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)',
          color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }} />
      <button onClick={handleParse}
        className="h-11 rounded-2xl text-[14px] font-semibold"
        style={{ background: 'var(--color-app-accent-soft)', border: '1px solid var(--color-app-accent-border-2)',
          color: 'var(--color-app-accent)', cursor: 'pointer' }}>
        Распарсить
      </button>
      {error && <p className="text-[12px]" style={{ color: 'var(--color-app-error)' }}>{error}</p>}
      <ImportPreview exercises={parsed} onClear={() => { setParsed([]); setText('') }} />
    </div>
  )
}

// ─── Excel ──────────────────────────────────────────────────────────────

function ExcelImporter() {
  const [parsed, setParsed] = useState<CreateExerciseInput[]>([])
  const [error, setError]   = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  function handleFile(file: File) {
    setFileName(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data  = new Uint8Array(e.target?.result as ArrayBuffer)
        const book  = XLSX.read(data, { type: 'array' })
        const sheet = book.Sheets[book.SheetNames[0]]
        const rows  = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
        const exs   = rows.map(rowToExercise).filter(Boolean) as CreateExerciseInput[]
        if (!exs.length) { setError('Не нашёл валидных строк. Проверь колонку с названием.'); return }
        setParsed(exs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка чтения файла')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <FileInput accept=".xlsx,.xls" onPick={handleFile} label="Загрузить .xlsx" />
      {fileName && (
        <p className="text-[12px]" style={{ color: 'var(--color-app-muted)' }}>
          Файл: {fileName}
        </p>
      )}
      {error && <p className="text-[12px]" style={{ color: 'var(--color-app-error)' }}>{error}</p>}
      <ImportPreview exercises={parsed} onClear={() => { setParsed([]); setFileName('') }} />
    </div>
  )
}

// ─── Obsidian (Markdown) ─────────────────────────────────────────────────

function ObsidianImporter() {
  const [text, setText]     = useState('')
  const [parsed, setParsed] = useState<CreateExerciseInput[]>([])
  const [error, setError]   = useState<string | null>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => setText(String(e.target?.result ?? ''))
    reader.readAsText(file)
  }

  function handleParse() {
    setError(null)
    if (!text.trim()) { setError('Вставь содержимое или загрузи .md файл'); return }
    const rows = parseMarkdownTable(text)
    const exs  = rows.map(rowToExercise).filter(Boolean) as CreateExerciseInput[]
    if (!exs.length) {
      setError('Не нашёл валидной markdown-таблицы. Проверь формат.')
      return
    }
    setParsed(exs)
  }

  return (
    <div className="flex flex-col gap-3">
      <FileInput accept=".md,text/markdown" onPick={handleFile} label="Загрузить .md" />
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
        placeholder={'| название | группа мышц | инвентарь |\n| --- | --- | --- |\n| Жим лёжа | грудь | Штанга |'}
        className="px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
        style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)',
          color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }} />
      <button onClick={handleParse}
        className="h-11 rounded-2xl text-[14px] font-semibold"
        style={{ background: 'var(--color-app-accent-soft)', border: '1px solid var(--color-app-accent-border-2)',
          color: 'var(--color-app-accent)', cursor: 'pointer' }}>
        Распарсить
      </button>
      {error && <p className="text-[12px]" style={{ color: 'var(--color-app-error)' }}>{error}</p>}
      <ImportPreview exercises={parsed} onClear={() => { setParsed([]); setText('') }} />
    </div>
  )
}

// ─── Notion ─────────────────────────────────────────────────────────────

function NotionImporter() {
  const [token, setToken] = useState('')
  const [dbId, setDbId]   = useState('')
  const [parsed, setParsed] = useState<CreateExerciseInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    if (!token.trim() || !dbId.trim()) { setError('Введи token и database ID'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/import/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), databaseId: dbId.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Ошибка запроса: ${res.status}`)
      }
      const data = await res.json() as { rows: Record<string, unknown>[] }
      const exs  = data.rows.map(rowToExercise).filter(Boolean) as CreateExerciseInput[]
      if (!exs.length) { setError('В базе Notion не нашлось строк с названием'); return }
      setParsed(exs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка Notion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
          Integration Token
        </label>
        <input value={token} onChange={e => setToken(e.target.value)} type="password"
          placeholder="secret_..."
          className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)',
            color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--color-app-muted)', fontFamily: 'var(--font-mono)' }}>
          Database ID
        </label>
        <input value={dbId} onChange={e => setDbId(e.target.value)}
          placeholder="32-символьный ID базы"
          className="px-3 py-2.5 rounded-xl text-[13px] outline-none"
          style={{ background: 'var(--color-app-surface2)', border: '1px solid var(--color-app-border)',
            color: 'var(--color-app-text)', fontFamily: 'var(--font-mono)' }} />
      </div>
      <button onClick={handleFetch} disabled={loading}
        className="h-11 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2"
        style={{ background: 'var(--color-app-accent-soft)', border: '1px solid var(--color-app-accent-border-2)',
          color: 'var(--color-app-accent)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading && <Spinner size={14} color="var(--color-app-accent)" />}
        {loading ? 'Загружаю…' : 'Загрузить из Notion'}
      </button>
      {error && <p className="text-[12px]" style={{ color: 'var(--color-app-error)' }}>{error}</p>}
      <p className="text-[11px]" style={{ color: 'var(--color-app-muted)' }}>
        Дай интеграции доступ к базе через меню «Connections» в Notion. Колонки: «Название», «Группа мышц», «Инвентарь».
      </p>
      <ImportPreview exercises={parsed} onClear={() => setParsed([])} />
    </div>
  )
}

// ─── File input ──────────────────────────────────────────────────────────

function FileInput({ accept, label, onPick }: { accept: string; label: string; onPick: (f: File) => void }) {
  return (
    <label className="h-11 rounded-2xl flex items-center justify-center text-[14px] font-semibold"
      style={{ background: 'var(--color-app-card)', border: '1px dashed var(--color-app-card-border)',
        color: 'var(--color-app-text)', cursor: 'pointer' }}>
      {label}
      <input type="file" accept={accept} className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ''
        }} />
    </label>
  )
}
