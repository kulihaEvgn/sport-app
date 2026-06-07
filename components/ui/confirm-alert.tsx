'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{ zIndex: 110, background: 'var(--color-app-overlay-2)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: 'var(--color-app-modal-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--color-app-surface3)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <p className="text-[18px] font-bold leading-snug" style={{ color: 'var(--color-app-text)' }}>
                {title}
              </p>
              {description && (
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-app-muted-2)' }}>
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
                  background: 'var(--color-app-surface)',
                  color: 'var(--color-app-text)',
                  border: '1px solid var(--color-app-surface3)',
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
                  background: loading ? 'var(--color-app-red-dark)' : 'var(--color-app-red)',
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
    </AnimatePresence>,
    document.body,
  )
}
