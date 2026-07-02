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
  // start_param намеренно НЕ кладём сюда: для startapp-ссылок Telegram отдаёт
  // параметр через launch param tgWebAppStartParam (см. setup-mock-env), и
  // хендлер читает именно его. Дублирование в initData маскировало бы ошибку.
  return new URLSearchParams({
    user: JSON.stringify(DEV_TELEGRAM_USER),
    auth_date: String(Math.floor(Date.now() / 1000)),
    hash: "dev-mock-hash",
    signature: "dev-mock-signature",
  }).toString();
}
