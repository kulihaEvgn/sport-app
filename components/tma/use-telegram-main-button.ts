"use client";

import { mainButton } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

type UseTelegramMainButtonOptions = {
  text: string;
  onClick: () => void;
  enabled?: boolean;
  loading?: boolean;
};

export function useTelegramMainButton({
  text,
  onClick,
  enabled = true,
  loading = false,
}: UseTelegramMainButtonOptions) {
  useEffect(() => {
    if (!mainButton.mount.isAvailable()) {
      return;
    }

    mainButton.mount();
    mainButton.setParams({
      text,
      isVisible: true,
      isEnabled: enabled && !loading,
      isLoaderVisible: loading,
    });

    const removeListener = mainButton.onClick(onClick);

    return () => {
      removeListener();
      if (mainButton.isMounted()) {
        mainButton.setParams({ isVisible: false });
        mainButton.unmount();
      }
    };
  }, [text, onClick, enabled, loading]);
}
