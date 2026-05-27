"use client";

import {
  init,
  miniApp,
  themeParams,
} from "@telegram-apps/sdk-react";
import { useEffect, useState, type ReactNode } from "react";

import { setupTelegramMockEnv } from "@/lib/telegram/setup-mock-env";

type TelegramProviderProps = {
  children: ReactNode;
};

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: VoidFunction | undefined;

    try {
      setupTelegramMockEnv();
      cleanup = init({ acceptCustomStyles: true });

      if (miniApp.mountSync.isAvailable()) {
        miniApp.mountSync();
      }
      if (themeParams.mountSync.isAvailable()) {
        themeParams.mountSync();
      }
      if (themeParams.bindCssVars.isAvailable()) {
        themeParams.bindCssVars();
      }
    } catch (error) {
      console.error("Telegram SDK init failed:", error);
    } finally {
      setReady(true);
    }

    return () => {
      cleanup?.();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      </div>
    );
  }

  return <>{children}</>;
}
