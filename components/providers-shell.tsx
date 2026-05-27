"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const TelegramProviders = dynamic(
  () =>
    import("@/components/providers").then((mod) => mod.Providers),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      </div>
    ),
  },
);

type ProvidersShellProps = {
  children: ReactNode;
};

/** Telegram SDK только на клиенте — иначе SSR падает с 500. */
export function ProvidersShell({ children }: ProvidersShellProps) {
  return <TelegramProviders>{children}</TelegramProviders>;
}
