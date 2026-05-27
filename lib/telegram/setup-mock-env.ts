import { isTMA, mockTelegramEnv } from "@telegram-apps/sdk";

import { buildDevInitDataRaw } from "@/lib/telegram/dev-init-data";

/** Имитирует Telegram Mini App в обычном браузере (только dev). */
export function setupTelegramMockEnv(): void {
  if (typeof window === "undefined" || isTMA()) {
    return;
  }

  const tgWebAppData = buildDevInitDataRaw();

  mockTelegramEnv({
    resetPostMessage: true,
    launchParams: new URLSearchParams({
      tgWebAppPlatform: "tdesktop",
      tgWebAppVersion: "8.0",
      tgWebAppData,
      tgWebAppThemeParams: JSON.stringify({
        bg_color: "#17212b",
        text_color: "#f5f5f5",
        hint_color: "#708499",
        link_color: "#6ab3f3",
        button_color: "#5288c1",
        button_text_color: "#ffffff",
        secondary_bg_color: "#232e3c",
      }),
    }),
  });
}
