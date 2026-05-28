"use client";

import { backButton } from "@telegram-apps/sdk-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Показывает Telegram BackButton на вложенных экранах (не на главной). */
export function useTelegramBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const ROOT_TABS = new Set(['/', '/workout', '/progress', '/profile', '/library/exercises', '/library/programs'])
  const isRoot = ROOT_TABS.has(pathname)

  useEffect(() => {
    if (isRoot) {
      if (backButton.isMounted()) {
        backButton.hide();
      }
      return;
    }

    if (!backButton.mount.isAvailable()) {
      return;
    }

    backButton.mount();
    backButton.show();

    const removeListener = backButton.onClick(() => {
      router.back();
    });

    return () => {
      removeListener();
      if (backButton.isMounted()) {
        backButton.hide();
        backButton.unmount();
      }
    };
  }, [isRoot, router]);
}
