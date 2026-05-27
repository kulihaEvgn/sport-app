import { mockTelegramEnv } from "@telegram-apps/sdk";

import { buildDevInitDataRaw } from "@/lib/telegram/dev-init-data";

type TelegramWindow = Window & {
  Telegram?: { WebApp?: unknown };
  TelegramWebviewProxy?: { postEvent?: (event: string, data?: string) => void };
};

function isRealTelegramClient(): boolean {
  return Boolean((window as TelegramWindow).Telegram?.WebApp);
}

function isMockAlreadyApplied(): boolean {
  return Boolean(
    (window as TelegramWindow).TelegramWebviewProxy?.postEvent,
  );
}

const mockLaunchParams = () =>
  new URLSearchParams({
    tgWebAppPlatform: "tdesktop",
    tgWebAppVersion: "8.0",
    tgWebAppData: buildDevInitDataRaw(),
    tgWebAppThemeParams: JSON.stringify({
      bg_color: "#17212b",
      text_color: "#f5f5f5",
      hint_color: "#708499",
      link_color: "#6ab3f3",
      button_color: "#5288c1",
      button_text_color: "#ffffff",
      secondary_bg_color: "#232e3c",
    }),
  });

/** Имитирует Telegram Mini App в обычном браузере (dev). */
export function setupTelegramMockEnv(force = false): void {
  if (typeof window === "undefined") {
    return;
  }

  if (isRealTelegramClient()) {
    return;
  }

  if (!force && isMockAlreadyApplied()) {
    return;
  }

  if (process.env.NODE_ENV !== "development" && !force) {
    return;
  }

  mockTelegramEnv({
    resetPostMessage: true,
    launchParams: mockLaunchParams(),
  });
}
