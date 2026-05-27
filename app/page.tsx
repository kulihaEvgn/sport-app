import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Sport App</h1>
      <p className="text-muted-foreground text-center text-sm">
        Telegram Mini App — тренировки и программы
      </p>
      <Button nativeButton={false} render={<Link href="/profile" />}>
        Профиль
      </Button>
    </main>
  );
}
