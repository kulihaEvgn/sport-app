"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TelegramProvider } from "@/components/tma/telegram-provider";
import { StartParamHandler } from "@/components/tma/start-param-handler";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <StartParamHandler />
        {children}
      </TelegramProvider>
    </QueryClientProvider>
  );
}
