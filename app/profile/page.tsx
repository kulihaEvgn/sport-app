"use client";

import { initDataUser, useSignal } from "@telegram-apps/sdk-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import { useClientInitData } from "@/components/tma/use-raw-init-data";
import { useTelegramBackButton } from "@/components/tma/use-telegram-back-button";
import { Button } from "@/components/ui/button";

type DbUser = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};

export default function ProfilePage() {
  useTelegramBackButton();
  const tgUser = useSignal(initDataUser);
  const initData = useClientInitData();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initData === undefined) return;

    if (!initData) {
      setDbStatus("Нет initData (откройте через Telegram или dev mock)");
      return;
    }

    apiFetch("/api/auth/me", { initData })
      .then(async (response) => {
        const body = (await response.json()) as DbUser & { error?: string };
        if (!response.ok) {
          setDbStatus(body.error ?? `HTTP ${response.status}`);
          return;
        }
        setDbUser(body);
        setDbStatus("ok");
      })
      .catch(() => {
        setDbStatus("Не удалось подключиться к API");
      });
  }, [initData]);

  const displayName =
    [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ") ||
    tgUser?.username ||
    "Гость";

  return (
    <main className="flex min-h-screen flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Профиль</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Telegram + пользователь в БД
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Telegram (SDK)</h2>
        <dl className="bg-card space-y-3 rounded-lg border p-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Имя</dt>
            <dd className="font-medium">{displayName}</dd>
          </div>
          {tgUser?.username ? (
            <div>
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-medium">@{tgUser.username}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">База данных</h2>
        <dl className="bg-card space-y-3 rounded-lg border p-4 text-sm">
          {dbUser ? (
            <>
              <div>
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-medium break-all">{dbUser.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telegram ID</dt>
                <dd className="font-medium">{dbUser.telegramId}</dd>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              {dbStatus ?? "Загрузка…"}
              {dbStatus && dbStatus !== "ok" ? (
                <>
                  <br />
                  <span className="text-xs">
                    Нужна БД: см. docs/DATABASE.md
                  </span>
                </>
              ) : null}
            </p>
          )}
        </dl>
      </section>

      <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
        На главную
      </Button>
    </main>
  );
}
