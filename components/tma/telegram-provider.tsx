"use client";

import {
  init,
  isUnknownEnvError,
  miniApp,
  themeParams,
} from "@telegram-apps/sdk-react";
import { useEffect, useState, type ReactNode } from "react";

import { setupTelegramMockEnv } from "@/lib/telegram/setup-mock-env";

type TelegramProviderProps = {
  children: ReactNode;
};

function mountTelegramUi() {
  if (miniApp.mountSync.isAvailable()) {
    miniApp.mountSync();
  }
  if (themeParams.mountSync.isAvailable()) {
    themeParams.mountSync();
  }
  if (themeParams.bindCssVars.isAvailable()) {
    themeParams.bindCssVars();
  }
}

function initializeSdk(): VoidFunction | undefined {
  setupTelegramMockEnv();

  try {
    const cleanup = init({ acceptCustomStyles: true });
    mountTelegramUi();
    return cleanup;
  } catch (error) {
    if (!isUnknownEnvError(error)) {
      throw error;
    }

    setupTelegramMockEnv(true);
    const cleanup = init({ acceptCustomStyles: true });
    mountTelegramUi();
    return cleanup;
  }
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: VoidFunction | undefined;

    try {
      cleanup = initializeSdk();
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
