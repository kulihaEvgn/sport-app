'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
  open: boolean
  youtubeId: string
  isShorts?: boolean
  title?: string
  onClose: () => void
}

export function VideoModal({ open, youtubeId, isShorts = false, title, onClose }: VideoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex flex-col items-center justify-center px-4"
          style={{ zIndex: 110, background: 'rgba(0,0,0,0.88)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="flex flex-col gap-3"
            style={{ width: isShorts ? 'min(72vw, 320px)' : '100%', maxWidth: isShorts ? undefined : '28rem' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              {title && (
                <p className="text-[15px] font-semibold truncate pr-3" style={{ color: '#f9fafb' }}>
                  {title}
                </p>
              )}
              <button
                onClick={onClose}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#9ca3af" />
              </button>
            </div>

            {/* Video */}
            <div
              className="w-full rounded-2xl overflow-hidden"
              style={{
                aspectRatio: isShorts ? '9/16' : '16/9',
                background: '#000',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0`}
                title={title ?? 'Видео упражнения'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
