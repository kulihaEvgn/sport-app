'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmAlertProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmAlert({
  open,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmAlertProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: 'rgba(18,18,30,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-[18px] font-bold leading-snug" style={{ color: '#f9fafb' }}>
                {title}
              </p>
              {description && (
                <p className="text-[14px] leading-relaxed" style={{ color: '#9ca3af' }}>
                  {description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-13 rounded-2xl font-semibold text-[15px] transition-opacity"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: '#f9fafb',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1,
                  height: 52,
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 h-13 rounded-2xl font-bold text-[15px] transition-opacity"
                style={{
                  background: loading ? '#7f1d1d' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  height: 52,
                }}
              >
                {loading ? '...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
