/** Тестовый пользователь для браузера без Telegram. */
export const DEV_TELEGRAM_USER = {
  id: 1,
  first_name: "Dev",
  last_name: "User",
  username: "devuser",
  language_code: "ru",
} as const;

/** Строка initData для dev (нужны hash + signature для парсера SDK). */
export function buildDevInitDataRaw(): string {
  return new URLSearchParams({
    user: JSON.stringify(DEV_TELEGRAM_USER),
    auth_date: String(Math.floor(Date.now() / 1000)),
    hash: "dev-mock-hash",
    signature: "dev-mock-signature",
  }).toString();
}
