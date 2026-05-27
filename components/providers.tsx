"use client";

import type { ReactNode } from "react";

import { TelegramProvider } from "@/components/tma/telegram-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <TelegramProvider>{children}</TelegramProvider>;
}
