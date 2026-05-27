import { parse, validate } from "@telegram-apps/init-data-node";

import { prisma } from "@/lib/prisma";
import { DEV_TELEGRAM_USER } from "@/lib/telegram/dev-init-data";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function getBotToken(): string {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }
  return token;
}

function isDevAuthBypass(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.BOT_TOKEN === "dev-placeholder"
  );
}

/** Читает initData из заголовка `Authorization: tma <raw>`. */
export function getInitDataFromRequest(request: Request): string {
  const header = request.headers.get("Authorization");

  if (!header?.startsWith("tma ")) {
    throw new AuthError("Missing Authorization: tma <initData>");
  }

  const raw = header.slice(4).trim();
  if (!raw) {
    throw new AuthError("Empty init data");
  }

  return raw;
}

/**
 * Проверяет initData (HMAC бота) и возвращает пользователя из БД (upsert).
 * В dev с BOT_TOKEN=dev-placeholder валидация подписи пропускается.
 */
export async function getUser(request: Request) {
  const raw = getInitDataFromRequest(request);

  if (!isDevAuthBypass()) {
    validate(raw, getBotToken(), { expiresIn: 86_400 });
  }

  let tgUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  } | undefined;

  try {
    tgUser = parse(raw).user;
  } catch {
    if (!isDevAuthBypass()) {
      throw new AuthError("Invalid init data");
    }
    tgUser = DEV_TELEGRAM_USER;
  }

  if (!tgUser?.id) {
    throw new AuthError("No user in init data");
  }

  return prisma.user.upsert({
    where: { telegramId: BigInt(tgUser.id) },
    create: {
      telegramId: BigInt(tgUser.id),
      username: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      lastName: tgUser.last_name ?? null,
      photoUrl: tgUser.photo_url ?? null,
    },
    update: {
      username: tgUser.username ?? null,
      firstName: tgUser.first_name ?? null,
      lastName: tgUser.last_name ?? null,
      photoUrl: tgUser.photo_url ?? null,
    },
  });
}
