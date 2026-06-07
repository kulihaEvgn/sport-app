'use client'

import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from '@/hooks/use-safe-area'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  maxHeight?: string
}

export function BottomSheet({ open, onClose, children, maxHeight = '85vh' }: BottomSheetProps) {
  const { bottom } = useSafeAreaInsets()

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 500) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 flex items-end"
          style={{ zIndex: 110, background: 'var(--color-app-overlay)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.25 }}
            onDragEnd={handleDragEnd}
            className="w-full rounded-t-3xl flex flex-col"
            style={{
              maxHeight,
              paddingBottom: bottom,
              background: 'var(--color-app-sheet-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--color-app-border)',
              borderBottom: 'none',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.55)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-app-handle)' }} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
