'use client'

import { useTelegramBackButton } from './use-telegram-back-button'

/** Монтирует в дерево — подключает Telegram Back Button ко всем страницам. */
export default function TelegramBackButtonSync() {
  useTelegramBackButton()
  return null
}
