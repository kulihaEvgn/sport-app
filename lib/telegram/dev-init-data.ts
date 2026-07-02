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
  const params = new URLSearchParams({
    user: JSON.stringify(DEV_TELEGRAM_USER),
    auth_date: String(Math.floor(Date.now() / 1000)),
    hash: "dev-mock-hash",
    signature: "dev-mock-signature",
  });

  // Локальный тест deep link: открой /?startapp=share_<shareId> в браузере —
  // start_param прокинется в initData так же, как это делает Telegram.
  if (typeof window !== "undefined") {
    const startapp = new URLSearchParams(window.location.search).get("startapp");
    if (startapp) params.set("start_param", startapp);
  }

  return params.toString();
}
