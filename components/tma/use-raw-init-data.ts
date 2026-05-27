"use client";

import { retrieveRawInitData } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";

import { buildDevInitDataRaw } from "@/lib/telegram/dev-init-data";

/** initData только на клиенте; повторяет чтение, пока SDK не готов. */
export function useClientInitData(): string | undefined {
  const [initData, setInitData] = useState<string | undefined>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = (raw: string | undefined) => {
      if (cancelled) return;
      if (raw) {
        setInitData(raw);
        setFailed(false);
        return true;
      }
      return false;
    };

    const read = (): string | undefined => {
      try {
        return retrieveRawInitData();
      } catch {
        return undefined;
      }
    };

    if (resolve(read())) {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(() => {
      if (resolve(read())) {
        window.clearInterval(interval);
      }
    }, 150);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (cancelled || read()) return;

      if (process.env.NODE_ENV === "development") {
        resolve(buildDevInitDataRaw());
      } else {
        setFailed(true);
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (failed) {
    return undefined;
  }

  return initData;
}
