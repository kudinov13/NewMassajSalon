# Оплата через Робокассу — как устроено и что осталось

## Текущее состояние

Оплата работает в **боевом режиме** (`ROBOKASSA_TEST=0` на сервере).
Проведён успешный тестовый платёж: заказ → страница Робокассы → колбэк → статус `paid` → письма админу и покупателю.

## Как это работает

1. Пользователь в корзине жмёт «Оформить и оплатить» → `POST /api/basket/checkout`
   создаёт заказ со статусом `pending` и возвращает платёжную ссылку Робокассы.
   Цена берётся из `products.price` на сервере — клиент её не передаёт.
2. Робокасса после оплаты вызывает `POST /payment/result` — сервер проверяет
   подпись MD5 (`OutSum:InvId:Пароль#2`) и сумму, помечает заказ `paid`,
   выдаёт доступ к курсам, шлёт письма.
3. Пользователя Робокасса редиректит на `/payment/success` (проверка подписи
   по Паролю #1) → SPA-страница `/payment-success`, либо `/payment/fail` → `/payment-fail`.
4. Неоплаченный заказ можно доплатить из «Истории покупок» (кнопка «Оплатить заказ»).

## Ключевые файлы

- `server/utils/robokassa.js` — подписи и платёжная ссылка
- `server/routes/payment.js` — колбэки и API оплаты
- `server/db/orders.js` — создание заказа, пометка оплаты
- `client/src/views/PaymentResultPage.tsx` — страницы успеха/ошибки

## Конфигурация (только на сервере, `.env` НЕ в git)

```
ROBOKASSA_LOGIN=koosmoru
ROBOKASSA_PASS1=...        # боевой пароль #1
ROBOKASSA_PASS2=...        # боевой пароль #2
ROBOKASSA_TEST_PASS1=...   # тестовый пароль #1
ROBOKASSA_TEST_PASS2=...   # тестовый пароль #2
ROBOKASSA_TEST=0           # 1 = тестовые карты, 0 = боевой режим
ROBOKASSA_RECEIPT=0        # 1 = передавать чек 54-ФЗ в Робокассу
ROBOKASSA_SNO=usn_income   # osn | usn_income | usn_income_outcome | esn | patent
ROBOKASSA_TAX=none         # none | vat0 | vat10 | vat20 | vat110 | vat120
```

В кабинете Робокассы (Мои магазины → Технические настройки):
- Result URL: `https://koosmo.ru/payment/result` (POST)
- Success URL: `https://koosmo.ru/payment/success` (GET)
- Fail URL: `https://koosmo.ru/payment/fail` (GET)
- Алгоритм хеша: MD5 (и в боевом, и в тестовом блоке)

## Что осталось сделать

### 1. Чеки 54-ФЗ (Робочеки) — на завтра

- В ЛК Робокассы: «Управление» → «Фискализация» → выбрать **«Робочеки»** → «Перейти с текущего»
  (сейчас стоит «Самостоятельное»). Бесплатно, включено в комиссию эквайринга.
- После активации на сервере в `.env` выставить:
  `ROBOKASSA_RECEIPT=1`, `ROBOKASSA_SNO=<система налогообложения ООО КООСМО>`,
  `ROBOKASSA_TAX=<ставка НДС>`, затем `systemctl restart koosmo`.
- Проверка: тестовая ссылка с `Receipt` перестанет падать с ошибкой 29;
  сделать тестовый платёж (`ROBOKASSA_TEST=1` временно) и посмотреть чек в ЛК.
- Чек формируется автоматически из позиций заказа: товары = `commodity`,
  позиции с привязкой к курсу = `service`, способ расчёта = `full_payment`.

### 2. Мониторинг

- Логи оплат: `journalctl -u koosmo -f` (строки `Robokassa result:`).
- «Зависшие» заказы со статусом `pending` видны в БД:
  `sqlite3 server/database.db "SELECT * FROM orders WHERE status='pending'"`.

### 3. Безопасность (рекомендовано, не блокирует)

- SMTP-пароль Яндекса раньше лежал в `.env` внутри публичного репозитория —
  стоит сменить пароль приложения в Яндексе и обновить `SMTP_PASS` на сервере.
- Файлы `server/uploads/*.mp4` (>100 МБ) в git не помещаются — лежат только на
  сервере. При бэкапах учитывать отдельно.

## Деплой (напоминание)

```
# локально: правки → сборка фронта (client: npm run build) → git push
# сервер:
cd /var/www/koosmo/NewMassajSalon && git pull
# если менялся бэкенд/зависимости:
cd server && npm ci && cd .. && systemctl restart koosmo
# если только фронт:
systemctl reload nginx
```
